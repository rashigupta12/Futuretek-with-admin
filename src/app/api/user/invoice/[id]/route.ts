// app/api/user/invoice/[id]/route.ts
import { NextRequest } from "next/server";
import { db } from "@/db";
import {
  PaymentsTable,
  EnrollmentsTable,
  CoursesTable,
  UserAddressTable,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

// Dynamically import pdfmake to avoid SSR issues
const getPdfMake = async () => {
  // @ts-ignore - pdfmake types are problematic
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  // @ts-ignore
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  
  const pdfMake = pdfMakeModule.default;
  if (pdfFontsModule.default?.vfs) {
    pdfMake.vfs = pdfFontsModule.default.vfs;
  }
  
  return pdfMake;
};

// Company data
const COMPANY = {
  name: "Futuretek Education Pvt. Ltd.",
  address: "Plot No. 42, Tech Park, Andheri East, Mumbai, Maharashtra 400093",
  gstin: "27AAECF1234R1Z5",
  pan: "AAECF1234R",
  phone: "+91 98765 43210",
  email: "accounts@futuretek.in",
  website: "https://futuretek.in",
};

// GET handler
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: "Invalid ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Fetch payment data
    const result = await db
      .select({
        payment: PaymentsTable,
        enrollment: EnrollmentsTable,
        course: CoursesTable,
        address: UserAddressTable,
      })
      .from(PaymentsTable)
      .leftJoin(
        EnrollmentsTable,
        eq(PaymentsTable.enrollmentId, EnrollmentsTable.id)
      )
      .leftJoin(CoursesTable, eq(EnrollmentsTable.courseId, CoursesTable.id))
      .leftJoin(
        UserAddressTable,
        eq(UserAddressTable.userId, PaymentsTable.userId)
      )
      .where(eq(PaymentsTable.id, id))
      .limit(1);

    const row = result[0];
    if (!row?.payment || row.payment.userId !== session.user.id) {
      return new Response(JSON.stringify({ error: "Invoice not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { payment, course, address } = row;
    const base = Number(payment.amount);
    const gst = Number(payment.gstAmount);
    const discount = Number(payment.discountAmount);
    const final = Number(payment.finalAmount);

    // Get pdfMake instance
    const pdfMake = await getPdfMake();

    // PDF document definition
    const docDefinition: any = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      
      header: {
        text: COMPANY.name,
        fontSize: 18,
        bold: true,
        alignment: "center",
        margin: [0, 20, 0, 0],
      },
      
      content: [
        // Title
        {
          text: "TAX INVOICE",
          fontSize: 22,
          bold: true,
          alignment: "center",
          margin: [0, 0, 0, 20],
        },

        // Invoice metadata
        {
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              alignment: "right",
              stack: [
                { text: `Invoice No: ${payment.invoiceNumber}`, bold: true },
                `Date: ${new Date(payment.createdAt).toLocaleDateString("en-IN")}`,
                `Status: ${payment.status}`,
              ],
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Bill To section
        { 
          text: "Bill To:", 
          fontSize: 12, 
          bold: true, 
          margin: [0, 10, 0, 5] 
        },
        { text: session.user.name ?? "N/A", margin: [0, 0, 0, 2] },
        { text: session.user.email ?? "N/A", margin: [0, 0, 0, 2] },
        address
          ? {
              text: `${address.addressLine1}${
                address.addressLine2 ? ", " + address.addressLine2 : ""
              }\n${address.city}, ${address.state} - ${address.pinCode}\n${address.country}`,
              margin: [0, 0, 0, 20],
            }
          : { text: "", margin: [0, 0, 0, 20] },

        // Table
        {
          table: {
            headerRows: 1,
            widths: ["*", "auto", "auto", "auto"],
            body: [
              [
                { text: "Description", bold: true },
                { text: "HSN/SAC", bold: true },
                { text: "Amount (₹)", bold: true },
                { text: "GST (₹)", bold: true },
              ],
              [
                course?.title ?? "Course Enrollment",
                "999293",
                base.toLocaleString("en-IN"),
                gst.toLocaleString("en-IN"),
              ],
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 20, 0, 20],
        },

        // Totals
        {
          columns: [
            { width: "*", text: "" },
            {
              width: "auto",
              alignment: "right",
              stack: [
                `Subtotal: ₹${base.toLocaleString("en-IN")}`,
                discount > 0
                  ? `Discount: -₹${discount.toLocaleString("en-IN")}`
                  : null,
                `CGST @9%: ₹${(gst / 2).toLocaleString("en-IN")}`,
                `SGST @9%: ₹${(gst / 2).toLocaleString("en-IN")}`,
                {
                  text: `Total Amount: ₹${final.toLocaleString("en-IN")}`,
                  fontSize: 14,
                  bold: true,
                  margin: [0, 5, 0, 0],
                },
              ].filter(Boolean),
            },
          ],
          margin: [0, 0, 0, 20],
        },

        // Amount in words
        {
          text: `In Words: Rupees ${numberToWords(final)} Only`,
          italics: true,
          margin: [0, 0, 0, 30],
        },

        // Company details
        {
          text: "Company Details",
          fontSize: 12,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        { text: COMPANY.address, fontSize: 9 },
        { text: `GSTIN: ${COMPANY.gstin} | PAN: ${COMPANY.pan}`, fontSize: 9 },
        { text: `Phone: ${COMPANY.phone}`, fontSize: 9 },
        { text: `Email: ${COMPANY.email}`, fontSize: 9, margin: [0, 0, 0, 20] },

        // Footer
        {
          text: "Thank you for choosing Futuretek!",
          alignment: "center",
          bold: true,
          margin: [0, 20, 0, 5],
        },
        {
          text: `For queries: ${COMPANY.email} | ${COMPANY.website}`,
          alignment: "center",
          fontSize: 9,
        },
      ],
    };

    // Generate PDF
    const pdfDoc = pdfMake.createPdf(docDefinition);

    return new Promise<Response>((resolve, reject) => {
      pdfDoc.getBuffer((buffer: Buffer) => {
        resolve(
          new Response(buffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename=Invoice_${payment.invoiceNumber}.pdf`,
            },
          })
        );
      });
    });
  } catch (error) {
    console.error("Invoice generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate invoice" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Indian Number to Words converter
function numberToWords(num: number): string {
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  if (num === 0) return "Zero";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundred = Math.floor(num / 100);
  num %= 100;

  let words = "";
  if (crore) words += convert(crore) + " Crore ";
  if (lakh) words += convert(lakh) + " Lakh ";
  if (thousand) words += convert(thousand) + " Thousand ";
  if (hundred) words += convert(hundred) + " Hundred ";
  if (num > 0) words += convert(num);

  return words.trim();

  function convert(n: number): string {
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    return "";
  }
}
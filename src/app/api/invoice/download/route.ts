/*eslint-disable  @typescript-eslint/no-explicit-any*/
// app/api/invoice/download/route.ts
import { db } from "@/db";
import { CoursesTable, PaymentsTable, UsersTable, EnrollmentsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: NextRequest) {
  try {
    const { invoiceNumber } = await req.json();

    if (!invoiceNumber) {
      return NextResponse.json(
        { error: "Invoice number is required" },
        { status: 400 }
      );
    }

    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized: User not logged in" },
        { status: 401 }
      );
    }

    // Get payment details
    const [payment] = await db
      .select()
      .from(PaymentsTable)
      .where(eq(PaymentsTable.invoiceNumber, invoiceNumber))
      .limit(1);

    if (!payment) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }

    // Verify user owns this invoice
    if (payment.userId !== userId) {
      return NextResponse.json(
        { error: "Unauthorized: You don't have access to this invoice" },
        { status: 403 }
      );
    }

    // Get user details
    const [user] = await db
      .select()
      .from(UsersTable)
      .where(eq(UsersTable.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get course details via enrollment
    if (!payment.enrollmentId) {
      return NextResponse.json(
        { error: "Enrollment not found for this payment" },
        { status: 404 }
      );
    }

    const [enrollment] = await db
      .select()
      .from(EnrollmentsTable)
      .where(eq(EnrollmentsTable.id, payment.enrollmentId))
      .limit(1);

    if (!enrollment) {
      return NextResponse.json(
        { error: "Enrollment details not found" },
        { status: 404 }
      );
    }

    const [course] = await db
      .select()
      .from(CoursesTable)
      .where(eq(CoursesTable.id, enrollment.courseId))
      .limit(1);

    if (!course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      );
    }

    // Generate PDF using pdf-lib
    const pdfBuffer = await generateInvoiceWithPDFLib({ payment, user, course });

  return new NextResponse(new Uint8Array(pdfBuffer), {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="Invoice-${invoiceNumber}.pdf"`,
  },
});

  } catch (error) {
    console.error("Invoice download error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}

async function generateInvoiceWithPDFLib(data: {
  payment: any;
  user: any;
  course: any;
}): Promise<Buffer> {
  const { payment, user, course } = data;

let PDFDocument, rgb, StandardFonts;

try {
  const pdfLib = await import("pdf-lib");
  PDFDocument = pdfLib.PDFDocument;
  rgb = pdfLib.rgb;
  StandardFonts = pdfLib.StandardFonts;
} catch (err) {
  console.error("❌ pdf-lib failed to load:", err);
  throw new Error("PDF library could not be loaded");
}


  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points

  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Set initial coordinates
  let y = 800;
  const leftMargin = 50;
  const rightMargin = 400;

  // Colors
  const blue = rgb(0.149, 0.388, 0.922); // #2563eb
  const gray = rgb(0.42, 0.45, 0.5); // #6b7280
  const green = rgb(0.02, 0.59, 0.41); // #059669
  const darkGray = rgb(0.17, 0.24, 0.31); // #2d3748

  // Header Section
  page.drawText('FUTURETEK', {
    x: leftMargin,
    y,
    size: 24,
    font: boldFont,
    color: blue,
  });

  page.drawText('INVOICE', {
    x: 400,
    y,
    size: 20,
    font: boldFont,
    color: darkGray,
  });
  y -= 30;

  // Invoice Number and Date
  page.drawText(`Invoice #: ${payment.invoiceNumber}`, {
    x: 400,
    y,
    size: 10,
    font: font,
    color: gray,
  });

  page.drawText(`Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN')}`, {
    x: 400,
    y: y - 15,
    size: 10,
    font: font,
    color: gray,
  });
  y -= 50;

  // Company Info
  page.drawText('Education & Training', {
    x: leftMargin,
    y,
    size: 12,
    font: font,
    color: gray,
  });
  y -= 20;

  page.drawText('Email: support@futuretek.com', {
    x: leftMargin,
    y,
    size: 10,
    font: font,
    color: gray,
  });
  y -= 15;

  page.drawText('Phone: +91 XXXXXXXXXX', {
    x: leftMargin,
    y,
    size: 10,
    font: font,
    color: gray,
  });
  y -= 40;

  // Bill To Section
  page.drawText('Bill To:', {
    x: leftMargin,
    y,
    size: 14,
    font: boldFont,
    color: darkGray,
  });
  y -= 20;

  page.drawText(user.name, {
    x: leftMargin,
    y,
    size: 12,
    font: boldFont,
  });
  y -= 15;

  page.drawText(user.email, {
    x: leftMargin,
    y,
    size: 10,
    font: font,
    color: gray,
  });
  y -= 15;

  if (payment.billingAddress) {
    page.drawText(payment.billingAddress, {
      x: leftMargin,
      y,
      size: 10,
      font: font,
      color: gray,
    });
    y -= 15;
  }

  if (user.gstNumber) {
    page.drawText(`GST No: ${user.gstNumber}`, {
      x: leftMargin,
      y,
      size: 10,
      font: font,
      color: gray,
    });
    y -= 15;
  }
  y -= 20;

  // Table Header
  page.drawLine({
    start: { x: leftMargin, y },
    end: { x: 545, y },
    thickness: 2,
    color: gray,
  });
  y -= 20;

  page.drawText('Description', {
    x: leftMargin,
    y,
    size: 12,
    font: boldFont,
    color: darkGray,
  });

  page.drawText('Amount', {
    x: rightMargin,
    y,
    size: 12,
    font: boldFont,
    color: darkGray,
  });
  y -= 30;

  // Course Item
  page.drawText(course.title, {
    x: leftMargin,
    y,
    size: 12,
    font: boldFont,
  });

  page.drawText(`RS.${parseFloat(payment.amount).toLocaleString('en-IN')}`, {
    x: rightMargin,
    y,
    size: 12,
    font: font,
  });
  y -= 25;

  if (course.description) {
    const descLines = wrapText(course.description, 60);
    descLines.forEach(line => {
      page.drawText(line, {
        x: leftMargin + 10,
        y,
        size: 9,
        font: font,
        color: gray,
      });
      y -= 12;
    });
    y -= 10;
  }

  // Discount
  if (parseFloat(payment.discountAmount) > 0) {
    page.drawText('Discount', {
      x: leftMargin,
      y,
      size: 11,
      font: font,
      color: green,
    });

    page.drawText(`-Rs.${parseFloat(payment.discountAmount).toLocaleString('en-IN')}`, {
      x: rightMargin,
      y,
      size: 11,
      font: font,
      color: green,
    });
    y -= 25;
  }

  // Subtotal
  page.drawText('Subtotal', {
    x: leftMargin,
    y,
    size: 12,
    font: boldFont,
  });

  const subtotal = parseFloat(payment.amount) - parseFloat(payment.discountAmount || '0');
  page.drawText(`Rs.${subtotal.toLocaleString('en-IN')}`, {
    x: rightMargin,
    y,
    size: 12,
    font: boldFont,
  });
  y -= 25;

  // GST
  page.drawText('GST (18%)', {
    x: leftMargin,
    y,
    size: 12,
    font: font,
  });

  page.drawText(`Rs.${parseFloat(payment.gstAmount).toLocaleString('en-IN')}`, {
    x: rightMargin,
    y,
    size: 12,
    font: font,
  });
  y -= 30;

  // Total
  page.drawLine({
    start: { x: leftMargin, y: y + 5 },
    end: { x: 545, y: y + 5 },
    thickness: 1,
    color: blue,
  });
  y -= 20;

  page.drawText('Total Amount', {
    x: leftMargin,
    y,
    size: 16,
    font: boldFont,
    color: blue,
  });

  page.drawText(`Rs.${parseFloat(payment.finalAmount).toLocaleString('en-IN')}`, {
    x: rightMargin,
    y,
    size: 16,
    font: boldFont,
    color: blue,
  });
  y -= 50;

  // Payment Details
  page.drawText('Payment Details', {
    x: leftMargin,
    y,
    size: 14,
    font: boldFont,
    color: darkGray,
  });
  y -= 25;

  page.drawText('Payment Method: Razorpay', {
    x: leftMargin,
    y,
    size: 11,
    font: font,
  });
  y -= 20;

  if (payment.razorpayPaymentId) {
    page.drawText(`Transaction ID: ${payment.razorpayPaymentId}`, {
      x: leftMargin,
      y,
      size: 10,
      font: font,
      color: gray,
    });
    y -= 20;
  }

  // Footer
  y = 50;
  page.drawText('Thank you for your purchase!', {
    x: leftMargin,
    y,
    size: 12,
    font: boldFont,
    color: gray,
  });
  y -= 20;

  page.drawText('This is a computer-generated invoice and does not require a signature.', {
    x: leftMargin,
    y,
    size: 9,
    font: font,
    color: gray,
  });
  y -= 15;

  page.drawText('For any queries, please contact support@futuretek.com', {
    x: leftMargin,
    y,
    size: 9,
    font: font,
    color: gray,
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

// Helper function to wrap text
function wrapText(text: string, maxLength: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + word).length > maxLength) {
      if (currentLine) lines.push(currentLine.trim());
      currentLine = word + ' ';
    } else {
      currentLine += word + ' ';
    }
  }

  if (currentLine) lines.push(currentLine.trim());
  return lines;
}
/*eslint-disable  @typescript-eslint/no-explicit-any*/
// lib/email/invoiceEmail.ts
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: parseInt(process.env.MAIL_PORT || '465'),
  secure: true,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

interface InvoiceEmailData {
  payment: any;
  user: any;
  course: any;
}

export async function createInvoiceEmailHTML(data: InvoiceEmailData) {
  const { payment, user, course } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .invoice-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .invoice-details { background: #f0f4f8; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .invoice-details h3 { color: #667eea; margin-top: 0; margin-bottom: 10px; font-size: 16px; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
        .detail-label { color: #6b7280; font-size: 14px; }
        .detail-value { font-weight: 600; color: #111827; font-size: 14px; }
        .total-row { background: #eff6ff; padding: 12px; border-radius: 4px; margin-top: 10px; }
        .total-row .detail-label { font-size: 16px; font-weight: 600; color: #1e40af; }
        .total-row .detail-value { font-size: 20px; font-weight: 700; color: #1e40af; }
        .button { background: #667eea; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0; font-weight: 600; }
        .button:hover { background: #5568d3; }
        .footer { text-align: center; margin-top: 20px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #666; font-size: 12px; }
        .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; border-radius: 4px; margin: 15px 0; }
        .info-box p { margin: 0; color: #92400e; font-size: 13px; }
        .success-badge { background: #d1fae5; color: #065f46; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Invoice - Payment Successful! 🎉</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Your course enrollment is confirmed</p>
        </div>
        <div class="content">
          <div class="invoice-box">
            <div style="text-align: center; margin-bottom: 20px;">
              <span class="success-badge">✓ PAID</span>
            </div>
            
            <h2 style="color: #667eea; margin-top: 0;">Invoice #${payment.invoiceNumber}</h2>
            <p style="color: #6b7280; font-size: 14px;">Date: ${new Date(payment.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}</p>
            
            <div class="invoice-details">
              <h3>Bill To</h3>
              <p style="margin: 5px 0; font-weight: 600; color: #111827;">${user.name}</p>
              <p style="margin: 5px 0; color: #6b7280; font-size: 14px;">${user.email}</p>
              ${user.gstNumber ? `<p style="margin: 5px 0; color: #6b7280; font-size: 14px;">GST No: ${user.gstNumber}</p>` : ''}
            </div>

            <div class="invoice-details">
              <h3>Course Details</h3>
              <div class="detail-row">
                <span class="detail-label">Course</span>
                <span class="detail-value">${course.title}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Original Price</span>
                <span class="detail-value">₹${parseFloat(payment.amount).toLocaleString('en-IN')}</span>
              </div>
              ${parseFloat(payment.discountAmount || '0') > 0 ? `
              <div class="detail-row" style="color: #059669;">
                <span class="detail-label">Discount</span>
                <span class="detail-value">-₹${parseFloat(payment.discountAmount).toLocaleString('en-IN')}</span>
              </div>
              ` : ''}
              <div class="detail-row">
                <span class="detail-label">Subtotal</span>
                <span class="detail-value">₹${(parseFloat(payment.amount) - parseFloat(payment.discountAmount || "0")).toLocaleString('en-IN')}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">GST (18%)</span>
                <span class="detail-value">₹${parseFloat(payment.gstAmount).toLocaleString('en-IN')}</span>
              </div>
              <div class="total-row">
                <div class="detail-row" style="border: none; padding: 0;">
                  <span class="detail-label">Total Paid</span>
                  <span class="detail-value">₹${parseFloat(payment.finalAmount).toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            <div class="invoice-details">
              <h3>Payment Information</h3>
              <div class="detail-row">
                <span class="detail-label">Payment Method</span>
                <span class="detail-value">Razorpay</span>
              </div>
              ${payment.razorpayPaymentId ? `
              <div class="detail-row">
                <span class="detail-label">Transaction ID</span>
                <span class="detail-value" style="font-family: monospace; font-size: 12px;">${payment.razorpayPaymentId}</span>
              </div>
              ` : ''}
              <div class="detail-row" style="border: none;">
                <span class="detail-label">Status</span>
                <span class="detail-value" style="color: #059669;">✓ Completed</span>
              </div>
            </div>
          </div>

          <div class="info-box">
            <p><strong>📎 Note:</strong> Your invoice is attached to this email as a PDF. You can also download it anytime from your dashboard.</p>
          </div>

          <div style="text-align: center; margin: 25px 0;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/user/courses" class="button">
              Go to My Courses
            </a>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/user/payments" class="button" style="background: #f59e0b; margin-left: 10px;">
              View All Invoices
            </a>
          </div>

          <p style="color: #6b7280; font-size: 14px; text-align: center;">
            If you have any questions about this invoice, please don't hesitate to contact our support team.
          </p>
        </div>
        <div class="footer">
          <p style="font-weight: 600; margin-bottom: 5px;">Thank you for choosing Futuretek!</p>
          <p>This is an automated email. Please do not reply to this message.</p>
          <p style="margin-top: 10px;">© ${new Date().getFullYear()} Futuretek. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

async function generateInvoicePDFAttachment(data: InvoiceEmailData): Promise<Buffer> {
  const { payment, user, course } = data;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        .invoice-container { max-width: 800px; margin: 0 auto; border: 2px solid #e5e7eb; border-radius: 8px; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }
        .company-info h1 { color: #2563eb; font-size: 32px; margin-bottom: 8px; }
        .company-info p { color: #6b7280; font-size: 14px; margin: 4px 0; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { font-size: 24px; margin-bottom: 8px; }
        .invoice-number { background: #eff6ff; padding: 8px 16px; border-radius: 4px; display: inline-block; margin: 8px 0; }
        .invoice-number p { color: #2563eb; font-weight: 600; font-size: 14px; }
        .customer-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .customer-details h3 { margin-bottom: 12px; font-size: 18px; }
        .customer-details p { color: #6b7280; font-size: 14px; margin: 4px 0; }
        .customer-name { font-weight: 600; color: #111827 !important; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        thead { background: #f3f4f6; border-bottom: 2px solid #d1d5db; }
        th { padding: 12px; text-align: left; font-weight: 600; color: #374151; font-size: 14px; }
        th:last-child { text-align: right; }
        td { padding: 16px 12px; border-bottom: 1px solid #e5e7eb; font-size: 14px; }
        td:last-child { text-align: right; font-weight: 600; }
        .course-name { font-weight: 600; color: #111827; margin-bottom: 4px; }
        .discount-row { color: #059669; }
        .subtotal-row { background: #f9fafb; font-weight: 600; }
        .total-row { background: #eff6ff; border-top: 2px solid #2563eb; }
        .total-row td { font-size: 18px; font-weight: 700; color: #2563eb; padding: 16px 12px; }
        .payment-details { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .payment-details h3 { margin-bottom: 12px; font-size: 18px; }
        .payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .payment-item p { color: #6b7280; font-size: 13px; margin-bottom: 4px; }
        .payment-value { font-weight: 600; color: #111827; font-size: 14px; }
        .footer { text-align: center; padding-top: 20px; border-top: 2px solid #e5e7eb; }
        .footer p { color: #6b7280; font-size: 13px; margin: 4px 0; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <h1>FUTURETEK</h1>
            <p>Education & Training</p>
            <p>Email: support@futuretek.com</p>
            <p>Phone: +91 XXXXXXXXXX</p>
          </div>
          <div class="invoice-info">
            <h2>INVOICE</h2>
            <div class="invoice-number">
              <p>${payment.invoiceNumber}</p>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
              Date: ${new Date(payment.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div class="customer-details">
          <h3>Bill To:</h3>
          <p class="customer-name">${user.name}</p>
          <p>${user.email}</p>
          ${user.gstNumber ? `<p>GST No: ${user.gstNumber}</p>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="course-name">${course.title}</div>
              </td>
              <td>₹${parseFloat(payment.amount).toLocaleString("en-IN")}</td>
            </tr>
            ${parseFloat(payment.discountAmount || '0') > 0 ? `
            <tr class="discount-row">
              <td>Discount Applied</td>
              <td>-₹${parseFloat(payment.discountAmount).toLocaleString("en-IN")}</td>
            </tr>
            ` : ""}
            <tr class="subtotal-row">
              <td>Subtotal</td>
              <td>₹${(parseFloat(payment.amount) - parseFloat(payment.discountAmount || "0")).toLocaleString("en-IN")}</td>
            </tr>
            <tr>
              <td>GST (18%)</td>
              <td>₹${parseFloat(payment.gstAmount).toLocaleString("en-IN")}</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount</td>
              <td>₹${parseFloat(payment.finalAmount).toLocaleString("en-IN")}</td>
            </tr>
          </tbody>
        </table>

        <div class="payment-details">
          <h3>Payment Details</h3>
          <div class="payment-grid">
            <div class="payment-item">
              <p>Payment Method</p>
              <div class="payment-value">Razorpay</div>
            </div>
            ${payment.razorpayPaymentId ? `
            <div class="payment-item">
              <p>Transaction ID</p>
              <div class="payment-value" style="font-family: monospace; font-size: 12px;">
                ${payment.razorpayPaymentId}
              </div>
            </div>
            ` : ""}
          </div>
        </div>

        <div class="footer">
          <p style="margin-bottom: 8px; font-weight: 600;">Thank you for your purchase!</p>
          <p>This is a computer-generated invoice and does not require a signature.</p>
          <p style="margin-top: 8px;">For any queries, please contact support@futuretek.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setContent(html);
  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
  });

  await browser.close();

  return Buffer.from(pdfBuffer);
}

export async function sendInvoiceEmail(data: InvoiceEmailData) {
  try {
    const { payment, user } = data;

    // Generate PDF attachment
    const pdfBuffer = await generateInvoicePDFAttachment(data);

    // Create email HTML
    const emailHTML = await createInvoiceEmailHTML(data);

    const mailOptions = {
      from: `"Futuretek" <${process.env.MAIL_USERNAME}>`,
      to: user.email,
      subject: `Invoice ${payment.invoiceNumber} - Payment Confirmation`,
      html: emailHTML,
      attachments: [
        {
          filename: `Invoice-${payment.invoiceNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Invoice email sent successfully to:", user.email);
    console.log("📧 Message ID:", result.messageId);

    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Invoice email sending error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
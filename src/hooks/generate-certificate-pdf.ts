// utils/generate-certificate-pdf.ts
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function generateCertificatePDF(
  certificateElement: HTMLElement,
  fileName: string
): Promise<{ pdfUrl: string; blob: Blob }> {
  try {
    // Capture the certificate as canvas with higher quality
    const canvas = await html2canvas(certificateElement, {
      scale: 3, // Higher quality for better PDF
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      width: certificateElement.scrollWidth,
      height: certificateElement.scrollHeight,
    });

    // Create PDF in landscape orientation
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate dimensions to fit the PDF
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 0.95;
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = (pdfHeight - imgHeight * ratio) / 2;

    // Convert canvas to image data
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    
    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    
    // Generate blob
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    return { pdfUrl, blob: pdfBlob };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate certificate PDF');
  }
}
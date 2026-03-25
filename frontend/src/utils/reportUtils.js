import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

/**
 * Export data to Excel
 * @param {Array} headers - Table headers
 * @param {Array} data - Table data (2D array)
 * @param {string} fileName - Name of the file
 * @param {Array} metaData - Optional header rows (e.g. Company Name, Date)
 */
export const exportToExcel = (headers, data, fileName = 'report', metaData = []) => {
  const wb = XLSX.utils.book_new();
  
  // Combine metadata, headers, and data
  const wsData = [...metaData, [], headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Set column widths
  ws['!cols'] = headers.map(() => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(wb, ws, "Report");
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

/**
 * Generate PDF using jsPDF
 * @param {Object} options - PDF options { title, subTitle, companyName, headers, body, fileName }
 * @returns {Blob} - PDF Blob for emailing
 */
export const generatePDF = (options) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const { title, subTitle, companyName, headers, body, fileName } = options;
  let pageWidth = doc.internal.pageSize.getWidth();
  let startY = 20;

  // Company Name
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(companyName || 'BlueCrown Capital', pageWidth / 2, startY, { align: "center" });
  startY += 8;

  // Title
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, startY, { align: "center" });
  startY += 6;

  // Subtitle
  if (subTitle) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(subTitle, pageWidth / 2, startY, { align: "center" });
    startY += 8;
  }

  // Table
  doc.autoTable({
    startY: startY,
    head: [headers],
    body: body,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    margin: { top: 20 }
  });

  return doc.output('blob');
};

/**
 * Generate a professional Receipt Voucher PDF
 * @param {Object} receipt - Receipt data
 * @returns {Blob} - PDF Blob
 */
export const generateVoucherPDF = (receipt) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let startY = 20;

  // Outer Border
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setLineWidth(0.5);
  doc.rect(margin, margin, contentWidth, 260);

  // Logo Placeholder (Using Blue Circle + Icon from JS)
  doc.setFillColor(15, 23, 42); // #0f172a
  doc.circle(pageWidth / 2, startY + 5, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.text("BC", pageWidth / 2, startY + 8.5, { align: "center" });

  startY += 20;

  // Header Title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("BLUECROWN CAPITAL", pageWidth / 2, startY, { align: "center" });
  startY += 7;

  // Company/Branch
  doc.setFontSize(12);
  doc.text(receipt.receiver?.companyName || "ABHINAVDCS", pageWidth / 2, startY, { align: "center" });
  startY += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(receipt.receiver?.city || "PUNE", pageWidth / 2, startY, { align: "center" });
  startY += 10;

  // Receipt Voucher Pill
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth / 2 - 25, startY - 4, 50, 8, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT VOUCHER", pageWidth / 2, startY + 1.5, { align: "center" });
  startY += 15;

  // Main Info Box
  doc.setTextColor(15, 23, 42);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  
  const drawRow = (label, value, x, y, width) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${label}:`, x + 2, y + 6);
    doc.setFont("helvetica", "normal");
    const labelWidth = doc.getTextWidth(`${label}: `);
    doc.text(String(value), x + labelWidth + 3, y + 6);
    doc.line(x, y + 10, x + width, y + 10); // horizontal line
  };

  const boxX = margin + 5;
  const boxWidth = contentWidth - 10;
  
  // Row 1: Receipt No & Date
  doc.line(boxX, startY, boxX + boxWidth, startY);
  drawRow("RECEIPT NO", receipt.receiptNumber, boxX, startY, boxWidth / 2);
  drawRow("DATE", new Date(receipt.dateTime).toLocaleDateString('en-GB').replace(/\//g, '-'), boxX + boxWidth / 2, startY, boxWidth / 2);
  doc.line(boxX + boxWidth / 2, startY, boxX + boxWidth / 2, startY + 10);
  startY += 10;

  // Row 2: Mode of Payment Header
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.rect(boxX, startY, boxWidth, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.text("MODE OF PAYMENT", pageWidth / 2, startY + 6.5, { align: "center" });
  doc.line(boxX, startY + 10, boxX + boxWidth, startY + 10);
  startY += 10;

  // Row 3: Online/Cash & Amount
  drawRow("ONLINE/CASH", receipt.paymentMode, boxX, startY, boxWidth / 2);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${receipt.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, boxX + boxWidth / 2 + 2, startY + 6);
  doc.line(boxX, startY + 10, boxX + boxWidth, startY + 10);
  doc.line(boxX + boxWidth / 2, startY, boxX + boxWidth / 2, startY + 10);
  startY += 10;

  // Row 4: Amount in Words
  const amountInWords = receipt.amountInWords || ""; // We'll pass this from frontend
  drawRow("AMOUNT IN WORDS", amountInWords, boxX, startY, boxWidth);
  startY += 10;

  // Row 5: From & Mobile
  const payerName = receipt.payer?.clientName || receipt.payer?.companyName || "N/A";
  drawRow("FROM", payerName, boxX, startY, boxWidth / 2);
  drawRow("MOBILE NO", receipt.payer?.contactNo || "N/A", boxX + boxWidth / 2, startY, boxWidth / 2);
  doc.line(boxX + boxWidth / 2, startY, boxX + boxWidth / 2, startY + 10);
  startY += 10;

  // Row 6: Narration
  drawRow("NARRATION", receipt.narration || "-", boxX, startY, boxWidth);
  startY += 10;

  // Row 7: Received By
  drawRow("RECEIVED BY", receipt.receivedBy?.name || "admin", boxX, startY, boxWidth);
  startY += 10;

  // Border lines
  doc.line(boxX, startY - 70, boxX, startY); // left
  doc.line(boxX + boxWidth, startY - 70, boxX + boxWidth, startY); // right

  // Disclaimer
  startY += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184); // #94a3b8
  doc.text("This is a computer generated receipt. Signature not required.", pageWidth / 2, startY, { align: "center" });

  return doc.output('blob');
};

export const formatIndianNumber = (x) => {
  if (x === 0) return "0.00";
  if (!x || isNaN(x)) return "0.00";
  const num = parseFloat(x).toFixed(2);
  const parts = num.split(".");
  let intPart = parts[0];
  let decPart = "." + parts[1];
  const lastThree = intPart.slice(-3);
  const otherNumbers = intPart.slice(0, -3);
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + (otherNumbers ? "," : "") + lastThree;
  return formatted + decPart;
};

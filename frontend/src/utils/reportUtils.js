import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel
 * @param {Array} headers - Table headers
 * @param {Array} data - Table data (2D array)
 * @param {string} fileName - Name of the file
 * @param {Array} metaData - Optional header rows (e.g. Company Name, Date)
 */
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

  // Auto-size columns
  const colWidths = headers.map((h, i) => {
    let max = h.length;
    data.forEach(row => {
      const val = row[i] ? row[i].toString() : '';
      if (val.length > max) max = val.length;
    });
    return { wch: Math.min(max + 5, 50) }; // Cap at 50
  });
  ws['!cols'] = colWidths;

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

  // Header Background
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Company Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(companyName || 'BlueCrown Capital', pageWidth / 2, startY, { align: "center" });
  startY += 10;

  // Title
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(title, pageWidth / 2, startY, { align: "center" });
  startY += 8;

  // Subtitle
  if (subTitle) {
    doc.setFontSize(10);
    doc.text(subTitle, pageWidth / 2, startY, { align: "center" });
  }

  startY = 50;

  // Table
  autoTable(doc, {
    startY: startY,
    head: [headers],
    body: body,
    theme: 'grid',
    styles: { 
      fontSize: 8, 
      cellPadding: 3,
      valign: 'middle',
      font: 'helvetica'
    },
    headStyles: { 
      fillColor: [15, 23, 42], 
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'left' }
    },
    margin: { top: 20, left: 10, right: 10 }
  });

  // Footer
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 20, doc.internal.pageSize.getHeight() - 10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 20, doc.internal.pageSize.getHeight() - 10);
  }

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

/**
 * Generate a professional Payment Voucher PDF
 * @param {Object} payment - Payment data
 * @returns {Blob} - PDF Blob
 */
export const generatePaymentPDF = (payment) => {
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

  // Logo Placeholder
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
  doc.text(payment.payer?.companyName || "BLUECROWN ELITE", pageWidth / 2, startY, { align: "center" });
  startY += 5;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(payment.payer?.city || "PUNE", pageWidth / 2, startY, { align: "center" });
  startY += 10;

  // Payment Voucher Pill
  doc.setFillColor(15, 23, 42);
  doc.roundedRect(pageWidth / 2 - 25, startY - 4, 50, 8, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PAYMENT VOUCHER", pageWidth / 2, startY + 1.5, { align: "center" });
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
    doc.line(x, y + 10, x + width, y + 10);
  };

  const boxX = margin + 5;
  const boxWidth = contentWidth - 10;
  
  // Row 1: Payment No & Date
  doc.line(boxX, startY, boxX + boxWidth, startY);
  drawRow("PAYMENT NO", payment.paymentNumber, boxX, startY, boxWidth / 2);
  drawRow("DATE", new Date(payment.dateTime).toLocaleDateString('en-GB').replace(/\//g, '-'), boxX + boxWidth / 2, startY, boxWidth / 2);
  doc.line(boxX + boxWidth / 2, startY, boxX + boxWidth / 2, startY + 10);
  startY += 10;

  // Row 2: Mode of Payment Header
  doc.setFillColor(248, 250, 252);
  doc.rect(boxX, startY, boxWidth, 10, 'F');
  doc.setFont("helvetica", "bold");
  doc.text("MODE OF PAYMENT", pageWidth / 2, startY + 6.5, { align: "center" });
  doc.line(boxX, startY + 10, boxX + boxWidth, startY + 10);
  startY += 10;

  // Row 3: Online/Cash & Amount
  drawRow("ONLINE/CASH", payment.paymentMode, boxX, startY, boxWidth / 2);
  doc.setFont("helvetica", "bold");
  doc.text(`Rs. ${payment.amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, boxX + boxWidth / 2 + 2, startY + 6);
  doc.line(boxX, startY + 10, boxX + boxWidth, startY + 10);
  doc.line(boxX + boxWidth / 2, startY, boxX + boxWidth / 2, startY + 10);
  startY += 10;

  // Row 4: Amount in Words
  drawRow("AMOUNT IN WORDS", payment.amountInWords || "", boxX, startY, boxWidth);
  startY += 10;

  // Row 5: To & Mobile
  const receiverName = payment.receiver?.clientName || payment.receiver?.companyName || "N/A";
  drawRow("TO", receiverName, boxX, startY, boxWidth / 2);
  drawRow("MOBILE NO", payment.receiver?.contactNo || "N/A", boxX + boxWidth / 2, startY, boxWidth / 2);
  doc.line(boxX + boxWidth / 2, startY, boxX + boxWidth / 2, startY + 10);
  startY += 10;

  // Row 6: Narration
  drawRow("NARRATION", payment.narration || "-", boxX, startY, boxWidth);
  startY += 10;

  // Row 7: Paid By
  drawRow("PAID BY", payment.paidBy?.name || "admin", boxX, startY, boxWidth);
  startY += 10;

  // Border lines
  doc.line(boxX, startY - 70, boxX, startY);
  doc.line(boxX + boxWidth, startY - 70, boxX + boxWidth, startY);

  // Disclaimer
  startY += 10;
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184);
  doc.text("This is a computer generated voucher. Signature not required.", pageWidth / 2, startY, { align: "center" });

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

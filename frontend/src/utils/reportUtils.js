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

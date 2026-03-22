const asyncHandler = require('../utils/asyncHandler');
const reportService = require('../services/reportService');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get Day Report
// @route   GET /api/v1/reports/day
// @access  Private
const getDayReport = asyncHandler(async (req, res, next) => {
  const { companyId, date } = req.query;
  const report = await reportService.getDayReport(companyId, date);
  res.status(200).json(new ApiResponse(200, report, 'Day report retrieved successfully'));
});

// @desc    Get Ledger Report
// @route   GET /api/v1/reports/ledger
// @access  Private
const getLedgerReport = asyncHandler(async (req, res, next) => {
  const { companyId, counterpartyId, counterpartyType, dateFrom, dateTo } = req.query;
  const report = await reportService.getLedgerReport(
    companyId,
    counterpartyId,
    counterpartyType,
    dateFrom,
    dateTo,
    req.user.role,
    req.user.clientId
  );
  res.status(200).json(new ApiResponse(200, report, 'Ledger report retrieved successfully'));
});

// @desc    Get Cancel Receipt Report
// @route   GET /api/v1/reports/cancel-receipt
// @access  Private
const getCancelReceiptReport = asyncHandler(async (req, res) => {
  const { companyId, fromDate, toDate } = req.query;
  const report = await reportService.getCancelReceiptReport(companyId, fromDate, toDate);
  res.status(200).json(new ApiResponse(200, report, 'Cancel receipt report retrieved successfully'));
});

// @desc    Get Cancel Payment Report
// @route   GET /api/v1/reports/cancel-payment
// @access  Private
const getCancelPaymentReport = asyncHandler(async (req, res) => {
  const { companyId, fromDate, toDate } = req.query;
  const report = await reportService.getCancelPaymentReport(companyId, fromDate, toDate);
  res.status(200).json(new ApiResponse(200, report, 'Cancel payment report retrieved successfully'));
});

// @desc    Get Admin Charges Report
// @route   GET /api/v1/reports/admin-charges
// @access  Private
const getAdminChargesReport = asyncHandler(async (req, res) => {
  const { companyId, investmentId, clientId } = req.query;
  const report = await reportService.getAdminChargesReport(companyId, investmentId, clientId);
  res.status(200).json(new ApiResponse(200, report, 'Admin charges report retrieved successfully'));
});

// @desc    Get Penalty Charges Report
// @route   GET /api/v1/reports/penalty-charges
// @access  Private
const getPenaltyChargesReport = asyncHandler(async (req, res) => {
  const { companyId, loanId, clientId } = req.query;
  const report = await reportService.getPenaltyChargesReport(companyId, loanId, clientId);
  res.status(200).json(new ApiResponse(200, report, 'Penalty charges report retrieved successfully'));
});

// @desc    Get Investment Report
// @route   GET /api/v1/reports/investment-report
// @access  Private
const getInvestmentReport = asyncHandler(async (req, res) => {
  const { companyId, investmentId } = req.query;
  const report = await reportService.getInvestmentReport(companyId, investmentId, req.user.role, req.user.clientId);
  res.status(200).json(new ApiResponse(200, report, 'Investment report retrieved successfully'));
});

// @desc    Get Dashboard Stats
// @route   GET /api/v1/reports/dashboard-stats
// @access  Private
const getDashboardStats = asyncHandler(async (req, res, next) => {
  const stats = await reportService.getDashboardStats();
  res.status(200).json(new ApiResponse(200, stats, 'Dashboard stats retrieved successfully'));
});

// @desc    Get Self-Transfer Initial Data
// @route   GET /api/v1/reports/self-transfer-data
// @access  Private
const getSelfTransferData = asyncHandler(async (req, res, next) => {
  const data = await reportService.getSelfTransferData();
  res.status(200).json(new ApiResponse(200, data, 'Self-transfer data retrieved successfully'));
});

const getTransactionHistory = asyncHandler(async (req, res, next) => {
  const history = await reportService.getTransactionHistory();
  res.status(200).json(new ApiResponse(200, history, 'Transaction history retrieved successfully'));
});

// @desc    Send Report Email
// @route   POST /api/v1/reports/email
// @access  Private
const sendReportEmail = asyncHandler(async (req, res) => {
  const { recipientEmail, ccEmail, bccEmail, subject, message, reportType, reportData } = req.body;

  // Note: Attachment handling will be done by receiving a base64 or file upload.
  // For now, let's assume the frontend sends the PDF as a base64 or we generate it if needed.

  const sendEmail = require('../utils/sendEmail');

  const attachments = [];
  if (req.file) {
    attachments.push({
      filename: req.file.originalname,
      path: req.file.path
    });
  }

  await sendEmail({
    email: recipientEmail,
    subject: subject,
    message: message,
    html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
    attachments: attachments
  });

  // Clean up uploaded file
  if (req.file) {
    const fs = require('fs');
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting attachment:', err);
    });
  }

  res.status(200).json(new ApiResponse(200, null, 'Email sent successfully'));
});

module.exports = {
  getDayReport,
  getLedgerReport,
  getCancelReceiptReport,
  getCancelPaymentReport,
  getAdminChargesReport,
  getPenaltyChargesReport,
  getInvestmentReport,
  getDashboardStats,
  getTransactionHistory,
  getSelfTransferData,
  sendReportEmail
};

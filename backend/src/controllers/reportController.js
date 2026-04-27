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
  const { recipientEmail, subject, message, reportType } = req.body;

  if (!recipientEmail || !message) {
    return res.status(400).json(new ApiResponse(400, null, 'Recipient email and message are required'));
  }

  const sendEmail = require('../utils/sendEmail');

  const attachments = [];
  if (req.file) {
    attachments.push({
      filename: req.file.originalname,
      content: req.file.buffer
    });
  } else {
    console.warn('Email request received without attachment');
  }

  try {
    await sendEmail({
      email: recipientEmail,
      subject: subject || 'New Report from BlueCrown Capital',
      message: message,
      html: `<div style="font-family: sans-serif; line-height: 1.5; color: #333;">
               <p>${message.replace(/\n/g, '<br>')}</p>
               <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
               <p style="font-size: 0.8em; color: #777;">This is an automated report from BlueCrown Capital Elite Dashboard.</p>
             </div>`,
      attachments: attachments
    });

    res.status(200).json(new ApiResponse(200, null, 'Email sent successfully'));
  } catch (error) {
    console.error('Email Service Error:', error);
    res.status(500).json(new ApiResponse(500, null, `Email delivery failed: ${error.message}`));
  }
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

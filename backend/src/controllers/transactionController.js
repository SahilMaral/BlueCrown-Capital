const asyncHandler = require('../utils/asyncHandler');
const transactionService = require('../services/transactionService');
const Receipt = require('../models/Receipt');
const Payment = require('../models/Payment');
const ApiResponse = require('../utils/ApiResponse');

const createReceipt = asyncHandler(async (req, res) => {
  // Add receivedBy from logged in user
  req.body.receivedBy = req.user._id;
  const receipt = await transactionService.createReceipt(req.body);
  res.status(201).json(new ApiResponse(201, receipt, 'Receipt created successfully'));
});

const getReceipts = asyncHandler(async (req, res) => {
  // Basic filtering can be added here
  const receipts = await Receipt.find(req.query)
    .populate('payer')
    .populate('receiver')
    .populate('ledger')
    .populate('bank')
    .populate('receivedBy', 'name email')
    .sort({ createdAt: -1 });
    
  res.status(200).json(new ApiResponse(200, receipts, 'Receipts retrieved successfully'));
});

const getReceiptById = asyncHandler(async (req, res) => {
  const receipt = await Receipt.findById(req.params.id)
    .populate('payer')
    .populate('receiver')
    .populate('ledger')
    .populate('bank')
    .populate('receivedBy', 'name email');
    
  if (!receipt) {
    res.status(404);
    throw new Error('Receipt not found');
  }
  res.status(200).json(new ApiResponse(200, receipt, 'Receipt retrieved successfully'));
});

const createPayment = asyncHandler(async (req, res) => {
  // Add paidBy from logged in user
  req.body.paidBy = req.user._id;
  const payment = await transactionService.createPayment(req.body);
  res.status(201).json(new ApiResponse(201, payment, 'Payment created successfully'));
});

const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find(req.query)
    .populate('payer')
    .populate('receiver')
    .populate('ledger')
    .populate('bank')
    .populate('paidBy', 'name email')
    .sort({ createdAt: -1 });
    
  res.status(200).json(new ApiResponse(200, payments, 'Payments retrieved successfully'));
});

const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payment.findById(req.params.id)
    .populate('payer')
    .populate('receiver')
    .populate('ledger')
    .populate('bank')
    .populate('paidBy', 'name email');
    
  if (!payment) {
    res.status(404);
    throw new Error('Payment not found');
  }
  res.status(200).json(new ApiResponse(200, payment, 'Payment retrieved successfully'));
});

const createSelfTransfer = asyncHandler(async (req, res) => {
  // Add processedBy from logged in user
  req.body.processedBy = req.user._id;
  const transfer = await transactionService.createSelfTransfer(req.body);
  res.status(201).json(new ApiResponse(201, transfer, 'Self-transfer completed successfully'));
});

const updateReceipt = asyncHandler(async (req, res) => {
  const receipt = await transactionService.updateReceipt(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, receipt, 'Receipt updated successfully'));
});

const cancelReceipt = asyncHandler(async (req, res) => {
  const result = await transactionService.cancelReceipt(req.params.id);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

const sendReceiptEmail = asyncHandler(async (req, res) => {
  await transactionService.sendReceiptEmail(req.params.id, req.file);
  res.status(200).json(new ApiResponse(200, null, 'Receipt email sent successfully'));
});

const updatePayment = asyncHandler(async (req, res) => {
  const payment = await transactionService.updatePayment(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, payment, 'Payment updated successfully'));
});

const cancelPayment = asyncHandler(async (req, res) => {
  const result = await transactionService.cancelPayment(req.params.id);
  res.status(200).json(new ApiResponse(200, null, result.message));
});

const sendPaymentEmail = asyncHandler(async (req, res) => {
  await transactionService.sendPaymentEmail(req.params.id, req.file);
  res.status(200).json(new ApiResponse(200, null, 'Payment email sent successfully'));
});

module.exports = {
  createReceipt,
  getReceipts,
  getReceiptById,
  updateReceipt,
  cancelReceipt,
  sendReceiptEmail,
  createPayment,
  getPayments,
  getPaymentById,
  updatePayment,
  cancelPayment,
  sendPaymentEmail,
  createSelfTransfer
};

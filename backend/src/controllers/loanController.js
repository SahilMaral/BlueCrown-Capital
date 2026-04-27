const asyncHandler = require('../utils/asyncHandler');
const loanService = require('../services/loanService');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create new loan
// @route   POST /api/v1/loans
// @access  Private
const createLoan = asyncHandler(async (req, res, next) => {
  const loan = await loanService.createLoan(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, loan, 'Loan created successfully'));
});

// @desc    Get all loans
// @route   GET /api/v1/loans
// @access  Private
const getLoans = asyncHandler(async (req, res, next) => {
  const loans = await loanService.getLoans(req.user.id, req.user.role, req.user.clientId);
  res.status(200).json(new ApiResponse(200, loans, 'Loans retrieved successfully'));
});

// @desc    Get single loan
// @route   GET /api/v1/loans/:id
// @access  Private
const getLoan = asyncHandler(async (req, res, next) => {
  const loan = await loanService.getLoanById(req.params.id, req.user.id, req.user.role, req.user.clientId);
  res.status(200).json(new ApiResponse(200, loan, 'Loan retrieved successfully'));
});

// @desc    Update loan
// @route   PUT /api/v1/loans/:id
// @access  Private
const updateLoan = asyncHandler(async (req, res, next) => {
  const loan = await loanService.updateLoan(req.params.id, req.body, req.user.id);
  res.status(200).json(new ApiResponse(200, loan, 'Loan updated successfully'));
});

// @desc    Delete loan
// @route   DELETE /api/v1/loans/:id
// @access  Private
const deleteLoan = asyncHandler(async (req, res, next) => {
  await loanService.deleteLoan(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Loan deleted successfully'));
});

// @desc    Foreclose loan
// @route   POST /api/v1/loans/:id/foreclose
// @access  Private
const forecloseLoan = asyncHandler(async (req, res, next) => {
  const loan = await loanService.handleForeclosure({
    loanId: req.params.id,
    ...req.body
  }, req.user.id);
  res.status(200).json(new ApiResponse(200, loan, 'Loan foreclosed successfully'));
});

// @desc    Lumpsum payment
// @route   POST /api/v1/loans/:id/lumpsum
// @access  Private
const lumpsumLoan = asyncHandler(async (req, res, next) => {
  const loan = await loanService.handleLumpsum({
    loanId: req.params.id,
    ...req.body
  }, req.user.id);
  res.status(200).json(new ApiResponse(200, loan, 'Lumpsum payment processed successfully'));
});

// @desc    Get all loan reminders
// @route   GET /api/v1/loans/reminders
// @access  Private
const getReminders = asyncHandler(async (req, res, next) => {
  const reminders = await loanService.getReminders(req.user.id, req.user.role, req.user.clientId);
  res.status(200).json(new ApiResponse(200, reminders, 'Loan reminders retrieved successfully'));
});

const restructureLoan = asyncHandler(async (req, res) => {
  const result = await loanService.handleRestructure({ ...req.body, loanId: req.params.id }, req.user._id);
  res.status(200).json(new ApiResponse(200, result, 'Loan restructured successfully'));
});

const updateReminder = asyncHandler(async (req, res) => {
  const result = await loanService.updateReminder(req.params.reminderId, req.body, req.user._id);
  res.status(200).json(new ApiResponse(200, result, 'Reminder updated successfully'));
});

module.exports = {
  createLoan,
  getLoans,
  getLoan,
  updateLoan,
  deleteLoan,
  forecloseLoan,
  lumpsumLoan,
  getReminders,
  restructureLoan,
  updateReminder
};

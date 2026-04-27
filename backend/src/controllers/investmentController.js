const asyncHandler = require('../utils/asyncHandler');
const investmentService = require('../services/investmentService');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create new investment
// @route   POST /api/v1/investments
// @access  Private
const createInvestment = asyncHandler(async (req, res, next) => {
  const investment = await investmentService.createInvestment(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, investment, 'Investment created successfully'));
});

// @desc    Get all investments
// @route   GET /api/v1/investments
// @access  Private
const getInvestments = asyncHandler(async (req, res, next) => {
  const investments = await investmentService.getInvestments(req.user.id, req.user.role, req.user.clientId);
  res.status(200).json(new ApiResponse(200, investments, 'Investments retrieved successfully'));
});

// @desc    Get single investment
// @route   GET /api/v1/investments/:id
// @access  Private
const getInvestment = asyncHandler(async (req, res, next) => {
  const investmentData = await investmentService.getInvestmentById(req.params.id, req.user.id, req.user.role, req.user.clientId);
  res.status(200).json(new ApiResponse(200, investmentData, 'Investment retrieved successfully'));
});

// @desc    Update investment
// @route   PUT /api/v1/investments/:id
// @access  Private
const updateInvestment = asyncHandler(async (req, res, next) => {
  const investment = await investmentService.updateInvestment(req.params.id, req.body, req.user.id);
  res.status(200).json(new ApiResponse(200, investment, 'Investment updated successfully'));
});

// @desc    Delete investment
// @route   DELETE /api/v1/investments/:id
// @access  Private
const deleteInvestment = asyncHandler(async (req, res, next) => {
  await investmentService.deleteInvestment(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Investment deleted successfully'));
});

// @desc    Foreclose investment
// @route   POST /api/v1/investments/:id/foreclose
// @access  Private
const forecloseInvestment = asyncHandler(async (req, res, next) => {
  const investment = await investmentService.handleForeclosure({
    investmentId: req.params.id,
    ...req.body
  }, req.user.id);
  res.status(200).json(new ApiResponse(200, investment, 'Investment foreclosed successfully'));
});

// @desc    Lumpsum payment
// @route   POST /api/v1/investments/:id/lumpsum
// @access  Private
const lumpsumInvestment = asyncHandler(async (req, res, next) => {
  const investment = await investmentService.handleLumpsum({
    investmentId: req.params.id,
    ...req.body
  }, req.user.id);
  res.status(200).json(new ApiResponse(200, investment, 'Lumpsum payment processed successfully'));
});

// @desc    Restructure investment
// @route   POST /api/v1/investments/:id/restructure
// @access  Private
const restructureInvestment = asyncHandler(async (req, res, next) => {
  const investment = await investmentService.handleRestructure({
    investmentId: req.params.id,
    ...req.body
  }, req.user.id);
  res.status(200).json(new ApiResponse(200, investment, 'Investment restructured successfully'));
});

// @desc    Get all investment installments (collections)
// @route   GET /api/v1/investments/installments
// @access  Private
const getInvestmentInstallments = asyncHandler(async (req, res, next) => {
  const installments = await investmentService.getInvestmentInstallments(req.query);
  res.status(200).json(new ApiResponse(200, installments, 'Installments retrieved successfully'));
});

module.exports = {
  createInvestment,
  getInvestments,
  getInvestment,
  updateInvestment,
  deleteInvestment,
  forecloseInvestment,
  lumpsumInvestment,
  restructureInvestment,
  getInvestmentInstallments
};

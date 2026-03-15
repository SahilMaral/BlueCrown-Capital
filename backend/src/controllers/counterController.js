const counterService = require('../services/counterService');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get all counters
// @route   GET /api/v1/counters
// @access  Private
const getCounters = asyncHandler(async (req, res) => {
  const counters = await counterService.getCounters();
  res.status(200).json(new ApiResponse(200, counters, 'Counters retrieved successfully'));
});

// @desc    Create a new counter
// @route   POST /api/v1/counters
// @access  Private
const createCounter = asyncHandler(async (req, res) => {
  const counter = await require('../models/Counter').create(req.body);
  res.status(201).json(new ApiResponse(201, counter, 'Counter created successfully'));
});

// @desc    Update counter
// @route   PUT /api/v1/counters/:id
// @access  Private
const updateCounter = asyncHandler(async (req, res) => {
  const counter = await counterService.updateCounter(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, counter, 'Counter updated successfully'));
});

// @desc    Delete counter
// @route   DELETE /api/v1/counters/:id
// @access  Private
const deleteCounter = asyncHandler(async (req, res) => {
  await counterService.deleteCounter(req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Counter deleted successfully'));
});

module.exports = {
  getCounters,
  createCounter,
  updateCounter,
  deleteCounter
};

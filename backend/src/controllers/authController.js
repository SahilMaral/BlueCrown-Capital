const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  const userData = await authService.registerUser(req.body);
  
  res.status(201).json(new ApiResponse(201, userData, 'User registered successfully'));
});

// @desc    Authenticate a user
// @route   POST /api/v1/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  const { username, password } = req.body;
  
  const userData = await authService.loginUser(username, password);
  
  res.status(200).json(new ApiResponse(200, userData, 'Login successful'));
});

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res, next) => {
  const user = await authService.getUserProfile(req.user.id);

  res.status(200).json(new ApiResponse(200, user, 'User profile retrieved successfully'));
});

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
const updateDetails = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    email: req.body.email,
    phone: req.body.phone,
    designation: req.body.designation,
  };

  if (req.file) {
    fieldsToUpdate.photo = req.file.filename;
  }

  const user = await authService.updateUserDetails(req.user.id, fieldsToUpdate);

  res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  await authService.updatePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json(new ApiResponse(200, null, 'Password updated successfully'));
});

// @desc    Forgot password
// @route   POST /api/v1/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const protocol = req.protocol;
  const host = req.get('host');

  const result = await authService.forgotPassword(email, protocol, host);

  res.status(200).json(new ApiResponse(200, result, 'Email sent'));
});

// @desc    Reset password
// @route   PUT /api/v1/auth/resetpassword/:resettoken
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  const { password } = req.body;
  const resetToken = req.params.resettoken;

  const userData = await authService.resetPassword(resetToken, password);

  res.status(200).json(new ApiResponse(200, userData, 'Password reset successful'));
});

module.exports = {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
};

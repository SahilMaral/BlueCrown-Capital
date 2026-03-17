const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const query = {};
  
  // Non-super_admin users cannot see super_admin users
  if (req.user.role !== 'super_admin') {
    query.role = { $ne: 'super_admin' };
  }

  const users = await User.find(query).sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, users, 'Users retrieved successfully'));
});

// @desc    Create a new user
// @route   POST /api/v1/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res) => {
  const { name, username, email, password, role } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });
  if (userExists) {
    throw new ApiError(400, 'User already exists with this email or username');
  }

  // Restrict creating super_admin
  if (role === 'super_admin' && req.user.role !== 'super_admin') {
    throw new ApiError(403, 'Unauthorized to create a super_admin user');
  }

  const user = await User.create({
    name,
    username,
    email,
    password,
    role,
    phone: req.body.phone,
    designation: req.body.designation,
    clientId: req.body.clientId || null
  });

  res.status(201).json(new ApiResponse(201, user, 'User created successfully'));
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // If password is provided, it will be hashed by pre-save hook
  if (req.body.password === '') delete req.body.password;

  // Restrict editing a super_admin user
  if (user.role === 'super_admin' && req.user.role !== 'super_admin') {
    throw new ApiError(403, 'Unauthorized to edit a super_admin user');
  }

  // Restrict assigning super_admin role
  if (req.body.role === 'super_admin' && req.user.role !== 'super_admin') {
    throw new ApiError(403, 'Unauthorized to assign super_admin role');
  }

  const allowedFields = ['name', 'username', 'email', 'role', 'phone', 'designation', 'clientId', 'password'];
  const updateData = {};
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updateData[key] = req.body[key];
    }
  });

  const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true
  });

  res.status(200).json(new ApiResponse(200, updatedUser, 'User updated successfully'));
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent self-deletion
  if (user._id.toString() === req.user.id.toString()) {
    throw new ApiError(400, 'You cannot delete your own account');
  }

  await User.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, null, 'User deleted successfully'));
});

// @desc    Toggle user block status
// @route   PATCH /api/v1/users/:id/toggle-block
// @access  Private/Admin
const toggleUserBlock = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Prevent self-blocking
  if (user._id.toString() === req.user.id.toString()) {
    throw new ApiError(400, 'You cannot block your own account');
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json(new ApiResponse(200, user, `User ${user.isActive ? 'unblocked' : 'blocked'} successfully`));
});

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserBlock
};

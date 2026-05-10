const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const { serializeUser } = require('../utils/serializers');


const getUsers = catchAsync(async (req, res) => {
  const users = await User.find({})
    .select('name email role avatar createdAt updatedAt')
    .sort({ createdAt: -1 });

  return sendSuccess(res, {
    message: 'Users fetched successfully',
    data: users.map(serializeUser)
  });
});

const getUserById = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    'name email role avatar createdAt updatedAt'
  );

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sendSuccess(res, {
    message: 'User fetched successfully',
    data: serializeUser(user)
  });
});

const updateUser = catchAsync(async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.id !== req.params.id) {
    throw new ApiError(403, 'You can only update your own profile');
  }

  const body = { ...req.validated.body };
  if (req.user.role !== 'ADMIN') {
    delete body.role;
  }

  const user = await User.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  }).select('name email role avatar createdAt updatedAt');

  return sendSuccess(res, {
    message: 'User updated successfully',
    data: serializeUser(user)
  });
});

const deleteUser = catchAsync(async (req, res) => {
  await User.findByIdAndDelete(req.params.id);

  return sendSuccess(res, {
    message: 'User deleted successfully'
  });
});

module.exports = {
  deleteUser,
  getUserById,
  getUsers,
  updateUser
};

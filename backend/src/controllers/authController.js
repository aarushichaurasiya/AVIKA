const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { signAuthToken } = require('../services/tokenService');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw ApiError.conflict('An account with this email already exists');
  }

  // Only customer/cook can self-register — admin is granted manually, never via this endpoint.
  const allowedRole = ['customer', 'cook'].includes(role) ? role : 'customer';

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({ name, email, phone, passwordHash, role: allowedRole });

  const token = signAuthToken(user);
  sendSuccess(res, 201, { user, token });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized('Incorrect email or password');
  }
  if (!user.isActive) {
    throw ApiError.forbidden('This account has been disabled');
  }

  const token = signAuthToken(user);
  sendSuccess(res, 200, { user, token });
});

const me = asyncHandler(async (req, res) => {
  sendSuccess(res, 200, { user: req.user });
});

module.exports = { register, login, me };

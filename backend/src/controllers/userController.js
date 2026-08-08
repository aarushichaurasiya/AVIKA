const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  await user.save();
  sendSuccess(res, 200, user);
});

const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (req.body.isDefault) {
    user.addresses.forEach((a) => (a.isDefault = false));
  }
  user.addresses.push(req.body);
  await user.save();
  sendSuccess(res, 201, user.addresses);
});

const removeAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const before = user.addresses.length;
  user.addresses = user.addresses.filter((a) => a._id.toString() !== req.params.addressId);
  if (user.addresses.length === before) throw ApiError.notFound('Address not found');
  await user.save();
  sendSuccess(res, 200, user.addresses);
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { kitchenId } = req.params;
  const idx = user.favoriteKitchens.findIndex((id) => id.toString() === kitchenId);

  if (idx >= 0) {
    user.favoriteKitchens.splice(idx, 1);
  } else {
    user.favoriteKitchens.push(kitchenId);
  }
  await user.save();
  sendSuccess(res, 200, { favoriteKitchens: user.favoriteKitchens });
});

module.exports = { updateProfile, addAddress, removeAddress, toggleFavorite };

const MenuItem = require('../models/MenuItem');
const Kitchen = require('../models/Kitchen');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

async function assertKitchenOwnership(kitchenId, user) {
  const kitchen = await Kitchen.findById(kitchenId);
  if (!kitchen) throw ApiError.notFound('Kitchen not found');
  const isOwner = kitchen.owner.toString() === user._id.toString();
  if (!isOwner && user.role !== 'admin') {
    throw ApiError.forbidden('You can only manage your own kitchen\'s menu');
  }
  return kitchen;
}

// GET /api/kitchens/:kitchenId/menu
const listMenu = asyncHandler(async (req, res) => {
  const items = await MenuItem.find({ kitchen: req.params.kitchenId, isAvailable: true }).sort(
    'category name'
  );
  sendSuccess(res, 200, items);
});

const createMenuItem = asyncHandler(async (req, res) => {
  await assertKitchenOwnership(req.params.kitchenId, req.user);
  const item = await MenuItem.create({ ...req.body, kitchen: req.params.kitchenId });
  sendSuccess(res, 201, item);
});

const updateMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw ApiError.notFound('Menu item not found');
  await assertKitchenOwnership(item.kitchen, req.user);

  Object.assign(item, req.body);
  await item.save();
  sendSuccess(res, 200, item);
});

const deleteMenuItem = asyncHandler(async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) throw ApiError.notFound('Menu item not found');
  await assertKitchenOwnership(item.kitchen, req.user);

  // Soft delete: mark unavailable rather than removing, so past orders keep valid references.
  item.isAvailable = false;
  await item.save();
  sendSuccess(res, 200, { removed: true });
});

module.exports = { listMenu, createMenuItem, updateMenuItem, deleteMenuItem };

const Order = require('../models/Order');
const Kitchen = require('../models/Kitchen');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');
const { buildOrderItems, calculateTotals } = require('../services/orderService');

const createOrder = asyncHandler(async (req, res) => {
  const { kitchenId, items, deliveryAddress, paymentMethod, couponCode } = req.body;

  const kitchen = await Kitchen.findById(kitchenId);
  if (!kitchen || !kitchen.isOpen) {
    throw ApiError.badRequest('This kitchen is not accepting orders right now');
  }

  const orderItems = await buildOrderItems(kitchenId, items);
  const totals = calculateTotals(orderItems, kitchen);

  const order = await Order.create({
    customer: req.user._id,
    kitchen: kitchenId,
    items: orderItems,
    deliveryAddress,
    paymentMethod,
    couponCode,
    ...totals,
    estimatedDeliveryAt: new Date(Date.now() + kitchen.avgPrepTimeMinutes * 60000)
    // paymentStatus stays 'pending' here — for card/upi, the client confirms
    // payment against a Stripe PaymentIntent created separately, then a
    // webhook (see paymentController) flips this to 'paid'.
  });

  sendSuccess(res, 201, order);
});

// GET /api/orders/mine
const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .sort('-createdAt')
    .populate('kitchen', 'name logoUrl');
  sendSuccess(res, 200, orders);
});

const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('kitchen', 'name logoUrl owner');
  if (!order) throw ApiError.notFound('Order not found');

  const isCustomer = order.customer.toString() === req.user._id.toString();
  const isKitchenOwner = order.kitchen.owner?.toString() === req.user._id.toString();
  if (!isCustomer && !isKitchenOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You do not have access to this order');
  }

  sendSuccess(res, 200, order);
});

// PATCH /api/orders/:id/status — cook or admin advances the order
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id).populate('kitchen', 'owner');
  if (!order) throw ApiError.notFound('Order not found');

  const isKitchenOwner = order.kitchen.owner.toString() === req.user._id.toString();
  if (!isKitchenOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('Only the kitchen or an admin can update order status');
  }

  order.transitionTo(status);
  await order.save();
  sendSuccess(res, 200, order);
});

// GET /api/orders/kitchen/:kitchenId — orders for a cook's own kitchen
const kitchenOrders = asyncHandler(async (req, res) => {
  const kitchen = await Kitchen.findById(req.params.kitchenId);
  if (!kitchen) throw ApiError.notFound('Kitchen not found');

  const isOwner = kitchen.owner.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw ApiError.forbidden('You can only view orders for your own kitchen');
  }

  const { status, page = 1, limit = 20 } = req.query;
  const query = { kitchen: req.params.kitchenId };
  if (status) query.status = status;

  const skip = (Number(page) - 1) * Number(limit);
  const [orders, total] = await Promise.all([
    Order.find(query).sort('-createdAt').skip(skip).limit(Number(limit)).populate('customer', 'name phone'),
    Order.countDocuments(query)
  ]);

  sendSuccess(res, 200, orders, { page: Number(page), limit: Number(limit), total });
});

module.exports = { createOrder, myOrders, getOrder, updateOrderStatus, kitchenOrders };

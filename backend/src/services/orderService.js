const MenuItem = require('../models/MenuItem');
const ApiError = require('../utils/ApiError');

const TAX_RATE = 0.05; // 5% — adjust per your local food-service tax rules

/**
 * Re-prices a cart from the database. The client only sends menuItemId +
 * quantity; price, name, and availability are always re-checked here so a
 * tampered request can't change what gets charged.
 */
async function buildOrderItems(kitchenId, cartItems) {
  const ids = cartItems.map((i) => i.menuItemId);
  const dbItems = await MenuItem.find({ _id: { $in: ids }, kitchen: kitchenId });

  if (dbItems.length !== ids.length) {
    throw ApiError.badRequest('One or more items are no longer available from this kitchen');
  }

  const orderItems = cartItems.map((cartItem) => {
    const dbItem = dbItems.find((d) => d._id.toString() === cartItem.menuItemId);
    if (!dbItem.isAvailable) {
      throw ApiError.badRequest(`${dbItem.name} is currently unavailable`);
    }
    return {
      menuItem: dbItem._id,
      name: dbItem.name,
      price: dbItem.price,
      quantity: cartItem.quantity
    };
  });

  return orderItems;
}

function calculateTotals(orderItems, kitchen) {
  const subtotal = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (kitchen.minOrderAmount && subtotal < kitchen.minOrderAmount) {
    throw ApiError.badRequest(`Minimum order for this kitchen is ₹${kitchen.minOrderAmount}`);
  }

  const deliveryFee =
    kitchen.freeDeliveryThreshold && subtotal >= kitchen.freeDeliveryThreshold
      ? 0
      : kitchen.deliveryFee;

  const taxes = Math.round(subtotal * TAX_RATE);
  const total = subtotal + deliveryFee + taxes;

  return { subtotal, deliveryFee, taxes, total };
}

module.exports = { buildOrderItems, calculateTotals };

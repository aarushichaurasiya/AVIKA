const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'placed',
  'confirmed',
  'preparing',
  'ready',
  'out_for_delivery',
  'delivered',
  'cancelled'
];

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    // snapshot the name/price at order time so later menu edits don't rewrite history
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: ORDER_STATUSES, required: true },
    at: { type: Date, default: Date.now }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    kitchen: { type: mongoose.Schema.Types.ObjectId, ref: 'Kitchen', required: true, index: true },
    items: { type: [orderItemSchema], validate: (v) => v.length > 0 },

    deliveryAddress: {
      line1: { type: String, required: true },
      landmark: String,
      city: String,
      lat: Number,
      lng: Number,
      phone: { type: String, required: true },
      instructions: String
    },

    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    taxes: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },

    paymentMethod: { type: String, enum: ['card', 'upi', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    stripePaymentIntentId: String,

    status: { type: String, enum: ORDER_STATUSES, default: 'placed' },
    statusHistory: { type: [statusEventSchema], default: () => [{ status: 'placed' }] },

    estimatedDeliveryAt: Date,
    couponCode: String
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

orderSchema.methods.transitionTo = function (newStatus) {
  if (!ORDER_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid order status: ${newStatus}`);
  }
  this.status = newStatus;
  this.statusHistory.push({ status: newStatus, at: new Date() });
};

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;

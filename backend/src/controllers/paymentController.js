const stripe = require('../services/paymentService');
const env = require('../config/env');
const Order = require('../models/Order');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/ApiResponse');

// POST /api/payments/create-intent  { orderId }
const createIntent = asyncHandler(async (req, res) => {
  if (!stripe) throw ApiError.badRequest('Stripe is not configured on this server');

  const order = await Order.findById(req.body.orderId);
  if (!order) throw ApiError.notFound('Order not found');
  if (order.customer.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden('Not your order');
  }
  if (order.paymentStatus === 'paid') {
    throw ApiError.badRequest('This order is already paid');
  }

  const intent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // paise
    currency: 'inr',
    metadata: { orderId: order._id.toString() },
    automatic_payment_methods: { enabled: true } // lets Stripe offer card + UPI together
  });

  order.stripePaymentIntentId = intent.id;
  await order.save();

  sendSuccess(res, 200, { clientSecret: intent.client_secret });
});

// POST /api/payments/webhook — Stripe calls this directly, no auth, raw body
const webhook = asyncHandler(async (req, res) => {
  if (!stripe) return res.status(400).send('Stripe not configured');

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], env.stripeWebhookSecret);
  } catch (err) {
    return res.status(400).send(`Webhook signature verification failed: ${err.message}`);
  }

  if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
    const intent = event.data.object;
    const order = await Order.findOne({ stripePaymentIntentId: intent.id });
    if (order) {
      order.paymentStatus = event.type === 'payment_intent.succeeded' ? 'paid' : 'failed';
      if (order.paymentStatus === 'paid' && order.status === 'placed') {
        order.transitionTo('confirmed');
      }
      await order.save();
    }
  }

  res.json({ received: true });
});

module.exports = { createIntent, webhook };

const Stripe = require('stripe');
const env = require('../config/env');

const stripe = env.stripeSecretKey ? new Stripe(env.stripeSecretKey) : null;

module.exports = stripe;

const { body } = require('express-validator');

const createOrderRules = [
  body('kitchenId').isMongoId().withMessage('Invalid kitchen'),
  body('items').isArray({ min: 1 }).withMessage('Cart is empty'),
  body('items.*.menuItemId').isMongoId().withMessage('Invalid item'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('deliveryAddress.line1').trim().notEmpty().withMessage('Delivery address is required'),
  body('deliveryAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('paymentMethod').isIn(['card', 'upi', 'cod']).withMessage('Invalid payment method')
];

module.exports = { createOrderRules };

const express = require('express');
const {
  createOrder,
  myOrders,
  getOrder,
  updateOrderStatus,
  kitchenOrders
} = require('../controllers/orderController');
const { createOrderRules } = require('../validators/orderValidators');
const validateRequest = require('../middleware/validateRequest');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect); // every order route requires a logged-in user

router.post('/', createOrderRules, validateRequest, createOrder);
router.get('/mine', myOrders);
router.get('/kitchen/:kitchenId', requireRole('cook', 'admin'), kitchenOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', requireRole('cook', 'admin'), updateOrderStatus);

module.exports = router;

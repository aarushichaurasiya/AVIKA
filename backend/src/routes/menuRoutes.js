const express = require('express');
const {
  listMenu,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, requireRole } = require('../middleware/authMiddleware');

// mergeParams lets this router read :kitchenId from the parent route
const router = express.Router({ mergeParams: true });

router.get('/', listMenu);
router.post('/', protect, requireRole('cook', 'admin'), createMenuItem);
router.patch('/:id', protect, requireRole('cook', 'admin'), updateMenuItem);
router.delete('/:id', protect, requireRole('cook', 'admin'), deleteMenuItem);

module.exports = router;

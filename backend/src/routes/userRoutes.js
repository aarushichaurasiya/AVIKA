const express = require('express');
const {
  updateProfile,
  addAddress,
  removeAddress,
  toggleFavorite
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.patch('/me', updateProfile);
router.post('/me/addresses', addAddress);
router.delete('/me/addresses/:addressId', removeAddress);
router.post('/me/favorites/:kitchenId', toggleFavorite);

module.exports = router;

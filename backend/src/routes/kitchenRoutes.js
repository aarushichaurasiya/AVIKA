const express = require('express');
const {
  listKitchens,
  getKitchen,
  createKitchen,
  updateKitchen,
  listAllKitchensAdmin,
  approveKitchen,
  addEmployee,
  removeEmployee,
  myKitchen
} = require('../controllers/kitchenController');
const { protect, requireRole } = require('../middleware/authMiddleware');
const menuRoutes = require('./menuRoutes');

const router = express.Router();

router.get('/admin/all', protect, requireRole('admin'), listAllKitchensAdmin);
router.get('/mine', protect, requireRole('cook', 'admin'), myKitchen);
router.get('/', listKitchens);
router.get('/:id', getKitchen);
router.post('/', protect, requireRole('cook', 'admin'), createKitchen);
router.patch('/:id', protect, requireRole('cook', 'admin'), updateKitchen);
router.patch('/:id/approve', protect, requireRole('admin'), approveKitchen);
router.post('/:id/employees', protect, requireRole('cook', 'admin'), addEmployee);
router.delete('/:id/employees/:employeeId', protect, requireRole('cook', 'admin'), removeEmployee);

// /api/kitchens/:kitchenId/menu/...
router.use('/:kitchenId/menu', menuRoutes);

module.exports = router;

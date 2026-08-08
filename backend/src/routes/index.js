const express = require('express');
const authRoutes = require('./authRoutes');
const kitchenRoutes = require('./kitchenRoutes');
const orderRoutes = require('./orderRoutes');
const userRoutes = require('./userRoutes');
const paymentRoutes = require('./paymentRoutes');
const uploadRoutes = require('./uploadRoutes');

const router = express.Router();

router.get('/health', (_req, res) => res.json({ success: true, data: { status: 'ok' } }));

router.use('/auth', authRoutes);
router.use('/kitchens', kitchenRoutes);
router.use('/orders', orderRoutes);
router.use('/users', userRoutes);
router.use('/payments', paymentRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;

const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const transactionRoutes = require('./transactionRoutes');
const cartRoutes = require('./cartRoutes');
const uploadRoutes = require('./uploadRoutes'); 
const warrantyRoutes = require('./warrantyRoutes');
const userRoutes = require('./userRoutes');

router.get('/', (req, res) => {
  res.send('✅ EventEase API running');
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/transactions', transactionRoutes);
router.use('/cart', cartRoutes);
router.use('/warranties', warrantyRoutes);
router.use('/users', userRoutes);
router.use('/upload', uploadRoutes);

router.get('/config/cloudinary', (req, res) => {
  const { cloudinary } = require('../config/env');
  res.json({ name: cloudinary.name, preset: cloudinary.preset });
});

module.exports = router;
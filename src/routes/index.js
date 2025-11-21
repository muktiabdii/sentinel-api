const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const transactionRoutes = require('./transactionRoutes');
const uploadRoutes = require('./uploadRoutes');

router.get('/', (req, res) => {
  res.send('✅ EventEase API running');
});

router.use('/auths', authRoutes);
router.use('/products', productRoutes);
router.use('/transactions', transactionRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;
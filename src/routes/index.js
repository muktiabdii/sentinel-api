const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const transactionRoutes = require('./transactionRoutes');

router.get('/', (req, res) => {
  res.send('✅ EventEase API running');
});

router.use('/auths', authRoutes);
router.use('/products', productRoutes);
router.use('/transactions', transactionRoutes);

module.exports = router;
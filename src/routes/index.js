const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const ProductRoutes = require('./productRoutes');

router.get('/', (req, res) => {
  res.send('✅ EventEase API running');
});

router.use('/users', authRoutes);
router.use('/products', ProductRoutes);

module.exports = router;
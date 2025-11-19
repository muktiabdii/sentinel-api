const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');

router.get('/', (req, res) => {
  res.send('✅ EventEase API running');
});

router.use('/users', authRoutes);

module.exports = router;
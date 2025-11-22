const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const authMiddleware = require('../middlewares/authMiddleware');

// Semua route garansi butuh Login
router.use(authMiddleware);

// Endpoint list semua garansi user
router.get('/', warrantyController.getMyWarranties);

// Endpoint detail satu garansi
router.get('/:id', warrantyController.getDetail);

module.exports = router;
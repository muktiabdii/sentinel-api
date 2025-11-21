const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, productController.create);
router.get('/', productController.list);
router.delete('/:id', authMiddleware, productController.remove);

module.exports = router;

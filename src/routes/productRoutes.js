const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/productController');

router.post('/', ProductController.addProduct);
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getDetailProduct);

module.exports = router;

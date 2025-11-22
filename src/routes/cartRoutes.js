const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/add', authMiddleware, cartController.addToCart);
router.post('/increase', authMiddleware, cartController.increaseQty);
router.post('/decrease', authMiddleware, cartController.decreaseQty);
router.delete('/delete', authMiddleware, cartController.deleteItem);
router.get('/', authMiddleware, cartController.getCart);

module.exports = router;

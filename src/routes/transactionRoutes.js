const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.post('/', authMiddleware, transactionController.create);       
router.get('/', authMiddleware, transactionController.getHistory);      
router.get('/:id', authMiddleware, transactionController.getDetail);
router.post('/midtrans-notification', transactionController.midtransNotification);

module.exports = router;
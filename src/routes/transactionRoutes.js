const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware'); 

const router = express.Router();

router.use(authMiddleware);

router.post('/', transactionController.create);       
router.get('/', transactionController.getHistory);      
router.get('/:id', transactionController.getDetail);

module.exports = router;
const express = require('express');
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middlewares/authMiddleware'); // Sesuaikan path

const router = express.Router();

// Semua route di bawah ini butuh login
router.use(authMiddleware);

router.post('/', transactionController.create);          // Buat Pesanan
router.get('/', transactionController.getHistory);       // Lihat Riwayat
router.get('/:id', transactionController.getDetail);     // Lihat Detail per Transaksi

module.exports = router;
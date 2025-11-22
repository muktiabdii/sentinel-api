const transactionService = require('../services/transactionService');

module.exports = {
  async create(req, res) {
    try {
      const userId = req.user.id; // Dari middleware auth
      const { items, shipping_address, payment_method } = req.body;

      const transaction = await transactionService.createOrder(userId, {
        items,
        shipping_address,
        payment_method
      });

      res.status(201).json({
        message: 'Order created successfully',
        data: transaction
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async midtransNotification(req, res) {
    try {
      // verifikasi payload dari Midtrans
      const statusResponse = await midtransService.notification(req.body);

      // panggil service untuk update DB
      const paymentStatus = await transactionService.handleMidtransNotification(statusResponse);

      res.status(200).send('OK');
    } catch (err) {
      console.error(err);
      res.status(500).send('Error');
    }
  },

  async getHistory(req, res) {
    try {
      const userId = req.user.id;
      const history = await transactionService.getUserHistory(userId);
      
      res.json({ data: history });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getDetail(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params; // transaction id
      
      const detail = await transactionService.getTransactionDetail(id, userId);
      
      res.json({ data: detail });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
};
const cartService = require('../services/cartService');

module.exports = {
  async addToCart(req, res) {
    try {
      const userId = req.user.id; 
      const { productId } = req.body;

      const result = await cartService.addToCart(userId, productId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async increaseQty(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      const result = await cartService.increaseQty(userId, productId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async decreaseQty(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      const result = await cartService.decreaseQty(userId, productId);
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async deleteItem(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;

      await cartService.deleteItem(userId, productId);
      res.json({ success: true, message: "Item removed from cart" });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const items = await cartService.getCart(userId);

      res.json({ success: true, data: items });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

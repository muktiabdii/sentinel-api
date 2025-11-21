const Product = require('../models/productModel');

module.exports = {
  async createProduct(data) {
    try {
      const payload = { ...data };
      if (!payload.sku) {
        const rnd = Math.floor(Math.random() * 0xffff).toString(16).padStart(4, '0');
        payload.sku = `SKU-${Date.now()}-${rnd}`;
      }

      const created = await Product.create(payload);
      return created[0];
    } catch (err) {
      console.error('productService.createProduct error:', err);
      // Throw a normalized Error so controller can read message
      throw new Error((err && (err.message || JSON.stringify(err))) || 'Failed to create product');
    }
  },

  async listAll() {
    return Product.findAll();
  },

  async findById(id) {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  }
};

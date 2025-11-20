const Product = require('../models/productModel');

module.exports = {
    async getAllProducts() {
    return await Product.findAll();
  },

  async getDetailProduct(id) {
    const product = await Product.findById(id);
    if (!product) {
      throw new Error('Product not found');
    }
    return product;
  }
}

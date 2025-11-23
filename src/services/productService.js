const Product = require('../models/productModel');

module.exports = {
  async getAllProducts() {
    return await Product.findAll();
  },

  async getDetailProduct(id) {
    const product = await Product.findById(id);
    if (!product) throw new Error('Product not found');
    return product;
  },

  async addProduct(data) {
    const productData = {
      name: data.name,
      sku: data.sku,
      description: data.description,
      price: data.price,
      warranty_period_months: data.warranty_period_months || 12,
      
      // 1. Images (Array of URLs)
      image: Array.isArray(data.image) ? data.image : [data.image], 
      
      // 2. Colors (Array of Strings)
      color: Array.isArray(data.color) ? data.color : [data.color],
      
      // 3. Memories (Array of Strings)
      memori: Array.isArray(data.memori) ? data.memori : [data.memori]
    };

    return await Product.create(productData);
  }
};
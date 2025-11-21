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
  },

  async addProduct(data) {
    const productData = {
      name: data.name,
      sku: data.sku,
      description: data.description,
      price: data.price,
      color: data.color,
      memori: data.memori,
      warranty_period_months: data.warranty_period_months || 12,
      // Di sini data.image sudah berupa URL "https://res.cloudinary..." dari frontend
      image: data.image || 'https://via.placeholder.com/150' 
    };

    return await Product.create(productData);
  }
};

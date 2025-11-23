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

  // Logic hapus
  async deleteProduct(id) {
      return await Product.deleteById(id);
  },

  // Logic Tambah 
  async addProduct(data) {
    const productData = {
      name: data.name,
      sku: data.sku || `SKU-${Date.now()}`,
      description: data.description,
      price: data.price,
      warranty_period_months: data.warranty_period_months || 12,
      
      image: Array.isArray(data.image) ? data.image : [data.image], 
      color: Array.isArray(data.color) ? data.color : [data.color],
      memory: Array.isArray(data.memory) ? data.memory : [data.memory]
    };

    return await Product.create(productData);
  }
};
const db = require('../config/db');

const Product = {
  // Ambil semua produk
  findAll() {
    // ambil kolom image, color, memori Array
    return db('products')
      .select('id', 'image', 'name', 'memory', 'color', 'price')
      .orderBy('id', 'desc');
  },

  // Ambil detail produk
  findById(id) {
    return db('products')
      .select('*')
      .where({ id })
      .first();
  },

  // Ambil beberapa produk (untuk transaksi)
  findByIds(ids) {
    return db('products')
      .whereIn('id', ids)
      .select('id', 'price', 'name', 'sku', 'warranty_period_months', 'image'); 
  },

  // Create Produk Baru (Support Array)
  async create(productData) {
    return db('products')
      .insert(productData)
      .returning('*');
  },

  async deleteById(id) {
    return db('products').where({ id }).del().returning(['id']);
  }
};

module.exports = Product;
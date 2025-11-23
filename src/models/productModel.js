const db = require('../config/db');

const Product = {
  findAll() {
    // Pastikan select kolom yang benar
    return db('products')
      .select('id', 'image', 'name', 'memori', 'color', 'price')
      .orderBy('id', 'desc');
  },

  findById(id) {
    return db('products')
      .select('*')
      .where({ id })
      .first();
  },

  findByIds(ids) {
    return db('products')
      .whereIn('id', ids)
      .select('id', 'price', 'name', 'sku', 'warranty_period_months', 'image'); 
  },

  async create(productData) {
    // Insert data (Knex otomatis handle array ke format {a,b} postgres jika tipe kolomnya array)
    return db('products')
      .insert(productData)
      .returning('*');
  },

  async deleteById(id) {
    return db('products').where({ id }).del().returning(['id']);
  }
};

module.exports = Product;
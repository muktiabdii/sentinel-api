const db = require('../config/db');

const Product = {

  // fetch all products
  findAll() {
    return db('products')
      .select('id', 'image', 'name', 'memory', 'color', 'price');
  },

  // fetch product by id
  findById(id) {
    return db('products')
      .select('id', 'image', 'name', 'description', 'price', 'color', 'memory')
      .where({ id })
      .first();
  },

  // fetch multiple products by an array of ids
  findByIds(ids) {
    return db('products')
      .whereIn('id', ids)
      .select('id', 'price', 'name', 'sku', 'warranty_period_months'); 
  }
,
  async create(productData) {
    return db('products')
      .insert(productData)
      .returning(['id', 'image', 'name', 'description', 'price', 'color', 'memory']);
  }
};

module.exports = Product;
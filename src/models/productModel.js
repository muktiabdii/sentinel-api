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
  }
};

module.exports = Product;
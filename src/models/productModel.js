const db = require('../config/db');

const Product = {

  // fetch all products
  findAll() {
    return db('products')
      .select('id', 'image', 'name', 'memori', 'color', 'price');
  },

  // fetch product by id
  findById(id) {
    return db('products')
      .select('id', 'image', 'name', 'description', 'price', 'color', 'memori')
      .where({ id })
      .first();
  }
};

module.exports = Product;
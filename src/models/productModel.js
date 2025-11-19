const db = require('../config/db');

const Product = {
  // ambil produk berdasarkan array id
  async findByIds(ids) {
    return db('products').whereIn('id', ids).select('id', 'price', 'name', 'sku');
  }
};

module.exports = Product;
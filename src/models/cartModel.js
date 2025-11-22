const db = require('../config/db');

module.exports = {
  // Cari cart berdasarkan user
  findCartByUser: (userId) => {
    return db('carts').where({ user_id: userId }).first();
  },

  // Bikin cart baru
  createCart: (userId) => {
    return db('carts').insert({ user_id: userId }).returning('*');
  },

  // Cari item di cart
  findCartItem: (cartId, productId) => {
    return db('cart_items')
      .where({ cart_id: cartId, product_id: productId })
      .first();
  },

  // Tambahkan item baru
  addItem: (cartId, productId, quantity) => {
    return db('cart_items')
      .insert({ cart_id: cartId, product_id: productId, quantity })
      .returning('*');
  },

  // Update quantity
  updateQuantity: (cartId, productId, quantity) => {
    return db('cart_items')
      .where({ cart_id: cartId, product_id: productId })
      .update({ quantity })
      .returning('*');
  },

  // Delete item
  deleteItem: (cartId, productId) => {
    return db('cart_items')
      .where({ cart_id: cartId, product_id: productId })
      .del();
  },

  // Ambil semua item di cart (join products)
  getCartItems: (cartId) => {
    return db('cart_items as ci')
      .join('products as p', 'ci.product_id', 'p.id')
      .select(
        'ci.id',
        'p.name',
        'p.image',
        'p.price',
        'p.color',
        'p.memory',
        'ci.quantity'
      )
      .where('ci.cart_id', cartId);
  }
};

const Cart = require('../models/cartModel');

module.exports = {
  async addToCart(userId, productId) {
    let cart = await Cart.findCartByUser(userId);

    if (!cart) {
      const newCart = await Cart.createCart(userId);
      cart = newCart[0];
    }

    const existingItem = await Cart.findCartItem(cart.id, productId);

    if (existingItem) {
      // Tambah quantity +1
      return Cart.updateQuantity(cart.id, productId, existingItem.quantity + 1);
    }

    // Tambah item baru
    return Cart.addItem(cart.id, productId, 1);
  },

  async increaseQty(userId, productId) {
    const cart = await Cart.findCartByUser(userId);
    const item = await Cart.findCartItem(cart.id, productId);

    return Cart.updateQuantity(cart.id, productId, item.quantity + 1);
  },

  async decreaseQty(userId, productId) {
    const cart = await Cart.findCartByUser(userId);
    const item = await Cart.findCartItem(cart.id, productId);

    if (item.quantity <= 1) {
      return Cart.deleteItem(cart.id, productId);
    }

    return Cart.updateQuantity(cart.id, productId, item.quantity - 1);
  },

  async deleteItem(userId, productId) {
    const cart = await Cart.findCartByUser(userId);
    return Cart.deleteItem(cart.id, productId);
  },

  async getCart(userId) {
    const cart = await Cart.findCartByUser(userId);

    if (!cart) return [];

    return Cart.getCartItems(cart.id);
  }
};

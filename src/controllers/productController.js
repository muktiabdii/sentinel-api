const ProductService = require('../services/productService');

module.exports = {
  async getAllProducts(req, res) {
    try {
      const products = await ProductService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  async getDetailProduct(req, res) {
    try {
      const { id } = req.params;
      const product = await ProductService.getDetailProduct(id);
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(404).json({ success: false, message: err.message });
    }
  },

  async createProduct(req, res) {
    try {
      // req.body sekarang sudah berisi { name: "...", image: "https://..." }
      const newProduct = await ProductService.addProduct(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
      });
    } catch (err) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
};

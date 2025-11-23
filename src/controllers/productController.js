const productService = require('../services/productService');

module.exports = {
  async create(req, res) {
    try {
      const { name, description, price, color, memory, image } = req.body;

      if (!image || image.length === 0) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      if (!name) return res.status(400).json({ error: 'Name is required' });

      const payload = {
        name: String(name),
        description: description ? String(description) : null,
        price: price !== undefined ? Number(price) : 0,
        color: color, 
        memori: memory, 
        image: image,  
      };

      const newProduct = await productService.addProduct(payload); 

      res.status(201).json({ 
        success: true, 
        message: 'Product created', 
        data: newProduct 
      });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  async list(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.getDetailProduct(id);
      res.json({ success: true, data: product });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  },

  async remove(req, res) {
    try {
      const { id } = req.params;
      await productService.deleteProduct(id); 
      res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};
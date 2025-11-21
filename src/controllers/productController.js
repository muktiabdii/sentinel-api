const productService = require('../services/productService');

module.exports = {
  async create(req, res) {
    try {
      const { name, description, price, color, memory, image } = req.body;
      if (!image) return res.status(400).json({ error: 'Image URL is required' });

      // Basic validation
      if (!name) return res.status(400).json({ error: 'Name is required' });

      const payload = {
        name: String(name),
        description: description ? String(description) : null,
        price: price !== undefined && price !== null ? Number(price) : null,
        color: color ? String(color) : null,
        memory: memory ? String(memory) : null,
        image: String(image),
      };

      const newProduct = await productService.createProduct(payload);

      res.status(201).json({ message: 'Product created', product: newProduct });
    } catch (error) {
      console.error('Error creating product:', error);
      // prefer message, fallback to full error
      const msg = (error && (error.message || error.toString())) || 'Unknown error';
      res.status(500).json({ error: msg });
    }
  },

  async list(req, res) {
    try {
      const products = await productService.listAll();
      res.json({ products });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  ,
  async getDetail(req, res) {
    try {
      const { id } = req.params;
      const product = await productService.findById(id);
      res.json({ product });
    } catch (err) {
      res.status(404).json({ error: err.message });
    }
  }
};

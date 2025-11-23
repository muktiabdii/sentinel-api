const productService = require('../services/productService');

module.exports = {
async create(req, res) {
    try {
      const { name, description, price, color, memory, images } = req.body;

      if (!images || images.length === 0) {
        return res.status(400).json({ error: 'At least one image is required' });
      }

      if (!name) return res.status(400).json({ error: 'Name is required' });

      const payload = {
        name: String(name),
        description: description ? String(description) : null,
        price: price !== undefined ? Number(price) : null,
        color: color,  
        memory: memory, 
        image: images   
      };

      const newProduct = await productService.createProduct(payload);

      res.status(201).json({ message: 'Product created', product: newProduct });
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ error: error.message });
    }
  },

  async list(req, res) {
    try {
      const products = await productService.getAll();
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
  ,
  async remove(req, res) {
    try {
      const { id } = req.params;
      const deleted = await productService.deleteProduct(id);
      res.json({ message: 'Product deleted', id: deleted.id || deleted });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
};

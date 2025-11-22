const warrantyService = require('../services/warrantyService');

module.exports = {
  // GET /api/warranties
  async getMyWarranties(req, res) {
    try {
      const userId = req.user.id; // Dari token JWT
      const data = await warrantyService.getMyWarranties(userId);
      
      res.json({
        success: true,
        count: data.length,
        data: data
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },

  // GET /api/warranties/:id
  async getDetail(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params; // ID dari URL
      
      const data = await warrantyService.getWarrantyDetail(id, userId);
      
      res.json({
        success: true,
        data: data
      });
    } catch (error) {
      // Bedakan error 404/403 dengan 500
      if (error.message.includes('not found')) {
        return res.status(404).json({ success: false, error: error.message });
      }
      if (error.message.includes('Unauthorized')) {
        return res.status(403).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
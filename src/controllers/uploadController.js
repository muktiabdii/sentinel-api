const cloudinary = require('../config/cloudinary');
const { cloudinary: config } = require('../config/env');

module.exports = {
  // Endpoint: GET /api/upload/signature
  getUploadSignature(req, res) {
    try {
      const timestamp = Math.round((new Date).getTime() / 1000);
      const folder = 'sentinel_products'; // Nama folder di Cloudinary

      // Generate Signature menggunakan API Secret (Rahasia)
      const signature = cloudinary.utils.api_sign_request({
        timestamp: timestamp,
        folder: folder,
      }, config.apiSecret);

      // Kirim balik ke frontend
      res.json({
        success: true,
        payload: {
          signature: signature,
          timestamp: timestamp,
          cloudName: config.name,
          apiKey: config.apiKey,
          folder: folder
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
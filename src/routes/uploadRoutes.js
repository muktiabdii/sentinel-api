const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

router.get('/test', (req, res) => {
  res.json({ message: "Route Upload Berhasil Terbaca!", status: "OK" });
});

router.get('/signature', uploadController.getUploadSignature);

module.exports = router;
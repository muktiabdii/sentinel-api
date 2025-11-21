const cloudinary = require('cloudinary').v2;
const { cloudinary: config } = require('./env'); 

cloudinary.config({
  cloud_name: config.name,
  api_key: config.apiKey,
  api_secret: config.apiSecret,
});

module.exports = cloudinary;
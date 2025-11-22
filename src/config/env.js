const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("MIDTRANS CONFIG = ", {
  merchantId: process.env.MIDTRANS_MERCHANT_ID,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  isProduction: process.env.MIDTRANS_IS_PRODUCTION
});


module.exports = {
  db: {
    url: process.env.DB_URL
  },
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    preset: process.env.CLOUDINARY_PRESET,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  midtrans: {
  merchantId: process.env.MIDTRANS_MERCHANT_ID,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  }
};

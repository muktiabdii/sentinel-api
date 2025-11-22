const midtransClient = require('midtrans-client');
const env = require('../config/env');

console.log("MIDTRANS SNAP CONFIG =", {
  isProduction: env.midtrans.isProduction,
  serverKey: env.midtrans.serverKey,
  clientKey: env.midtrans.clientKey
});


const snap = new midtransClient.Snap({
    isProduction: env.midtrans.isProduction,
    serverKey: env.midtrans.serverKey,
    clientKey: env.midtrans.clientKey
});

module.exports = snap;

const midtransClient = require('midtrans-client');
const env = require('../config/env');

const snap = new midtransClient.Snap({
    isProduction: env.midtrans.isProduction,
    serverKey: env.midtrans.serverKey,
    clientKey: env.midtrans.clientKey
});

// Fungsi untuk memverifikasi payload dari Midtrans
async function notification(payload) {
    const core = new midtransClient.CoreApi({
        isProduction: env.midtrans.isProduction,
        serverKey: env.midtrans.serverKey,
        clientKey: env.midtrans.clientKey
    });

    const statusResponse = await core.transaction.notification(payload);
    return statusResponse;
}

module.exports = {
    snap,
    notification
};
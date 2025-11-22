import midtransClient from 'midtrans-client';
import env from '../config/env.js';

const snap = new midtransClient.Snap({
    isProduction: env.midtrans.isProduction,
    serverKey: env.midtrans.serverKey,
    clientKey: env.midtrans.clientKey
});

export default snap;

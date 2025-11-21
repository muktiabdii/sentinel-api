const Transaction = require('../models/transactionModel');
const Product = require('../models/productModel');
const blockchainService = require('./blockchainService');

module.exports = {
  async createOrder(userId, { items, shipping_address, payment_method }) {

    if (!items || items.length === 0) {
      throw new Error('Cart is empty');
    }

    // ambil data produk asli dari DB untuk validasi harga
    const productIds = items.map(i => i.productId);
    const products = await Product.findByIds(productIds);

    // map produk biar gampang dicari
    const productMap = new Map(products.map(p => [p.id, p]));

    let totalAmount = 0;
    const transactionDetailsPayload = [];

    // loop items untuk hitung total & siapkan data detail
    for (const item of items) {
      const product = productMap.get(item.productId);
      
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const subtotal = parseFloat(product.price) * item.quantity;
      totalAmount += subtotal;

      transactionDetailsPayload.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price,
        shipping_address: shipping_address,
        // estimated_delivery: bisa dihitung disini + 3 hari misalnya
      });
    }

    // siapkan payload Header Transaksi
    const transactionPayload = {
      user_id: userId,
      total_amount: totalAmount,
      payment_status: 'pending',
      order_status: 'processing',
      payment_method: payment_method,
      payment_gateway_references: `REF-${Date.now()}`,
    };

    // simpan ke DB via Model
    const newTransaction = await Transaction.createTransaction(
      transactionPayload, 
      transactionDetailsPayload
    );

    // loop setiap barang yang dibeli untuk dibuatkan garansinya
    for (const itemDetail of transactionDetailsPayload) {
        // Buat Serial Number Unik (Gabungan ID Produk + Waktu)
        const serialNumber = `SN-${itemDetail.product_id}-${Date.now()}`;
        
        // Set Garansi 1 Tahun dari sekarang (Unix Timestamp)
        const expiryDate = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);

        // Panggil Blockchain Service (Fire and Forget / Await)
        // Kita pakai await supaya log-nya kelihatan di terminal
        const txHash = await blockchainService.createWarranty(serialNumber, expiryDate);
        
        if (txHash) {
            console.log(`🎉 Garansi Barang ID ${itemDetail.product_id} Aman! Hash: ${txHash}`);
            // TODO (Nanti): Update kolom 'blockchain_tx_hash' di tabel database kamu
        }
    }

    return newTransaction;
  },

  async getUserHistory(userId) {
    return await Transaction.findByUserId(userId);
  },

  async getTransactionDetail(transactionId, userId) {
    const data = await Transaction.findDetailById(transactionId, userId);
    if (!data) throw new Error('Transaction not found');
    return data;
  }
};
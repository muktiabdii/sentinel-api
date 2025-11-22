const Transaction = require('../models/transactionModel');
const Product = require('../models/productModel');
const Warranty = require('../models/warrantyModel'); // 👈 Import Model Baru
const blockchainService = require('./blockchainService');

module.exports = {
  async createOrder(userId, { items, shipping_address, payment_method }) {

    if (!items || items.length === 0) {
      throw new Error('Cart is empty');
    }

    // ambil data produk untuk validasi & info garansi
    const productIds = items.map(i => i.productId);
    const products = await Product.findByIds(productIds);

    // map biar gampang ambil info product 
    const productMap = new Map(products.map(p => [p.id, p]));

    let totalAmount = 0;
    const transactionDetailsPayload = [];

    // loop items untuk hitung total
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
      });
    }

    // simpan Transaksi Utama 
    const transactionPayload = {
      user_id: userId,
      total_amount: totalAmount,
      payment_status: 'pending', 
      order_status: 'processing',
      payment_method: payment_method,
      payment_gateway_references: `REF-${Date.now()}`, // Placeholder sementara
    };

    const newTransaction = await Transaction.createTransaction(
      transactionPayload, 
      transactionDetailsPayload
    );

    // proses blockchain warranty untuk tiap item
    const warrantyResults = [];

    for (const itemDetail of transactionDetailsPayload) {
        // Ambil info produk lagi untuk tahu durasi garansi
        const productInfo = productMap.get(itemDetail.product_id);
        const warrantyMonths = productInfo.warranty_period_months || 12;

        // Generate Serial Number Unik
        const serialNumber = `SN-${itemDetail.product_id}-${Date.now()}`;
        
        // Hitung Expired Date untuk Blockchain (Detik)
        const expiryDateBlockchain = Math.floor(Date.now() / 1000) + (warrantyMonths * 30 * 24 * 3600);

        try {
            // Tembak ke Blockchain
            const txHash = await blockchainService.createWarranty(serialNumber, expiryDateBlockchain);
            
            if (txHash) {
                console.log(`🎉 Garansi Aman! Hash: ${txHash}`);

                // Simpan ke Tabel digital_warranty 
                await Warranty.create({
                    transaction_id: newTransaction.id,
                    user_id: userId,
                    product_id: itemDetail.product_id,
                    purchase_timestamp: new Date(), 
                    warranty_period_months: warrantyMonths,
                    blockchain_tx_hash: txHash,
                    on_chain_status: 'confirmed', 
                    status: 'active'
                });

                // Masukkan ke array result untuk response API
                warrantyResults.push({
                    product_id: itemDetail.product_id,
                    serial_number: serialNumber,
                    tx_hash: txHash
                });
            }
        } catch (error) {
            console.error(`⚠️ Gagal minting garansi untuk product ${itemDetail.product_id}:`, error.message);
            // Lanjutkan proses tanpa menghentikan transaksi utama
        }
    }

    // return data lengkap
    return {
        ...newTransaction,
        warranties: warrantyResults
    };
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
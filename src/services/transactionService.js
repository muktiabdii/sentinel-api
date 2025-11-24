const Transaction = require("../models/transactionModel");
const Product = require("../models/productModel");
const Warranty = require('../models/warrantyModel');
const db = require("../config/db");
const blockchainService = require("./blockchainService");
const { snap } = require("./midtransService");

module.exports = {
  async createOrder(userId, { items, shipping_address, payment_method }) {
    if (!items || items.length === 0) {
      throw new Error("Cart is empty");
    }

    // Ambil data produk
    const productIds = items.map((i) => i.productId);
    const products = await Product.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const transactionDetailsPayload = [];

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
        shipping_address,
      });
    }

    // Payload Header (DB)
    const transactionPayload = {
      user_id: userId,
      total_amount: totalAmount,
      payment_status: "pending",
      order_status: "processing",
      payment_method,
      payment_gateway_references: `REF-${Date.now()}`,
    };

    // Simpan database
    const newTransaction = await Transaction.createTransaction(
      transactionPayload,
      transactionDetailsPayload
    );

    // === MIDTRANS SNAP INTEGRATION ===
    const snapPayload = {
      transaction_details: {
        order_id: newTransaction.payment_gateway_references,
        gross_amount: totalAmount,
      },
      customer_details: {
        user_id: userId,
        shipping_address,
      },
      item_details: items.map((item) => ({
        id: item.productId,
        price: productMap.get(item.productId).price,
        quantity: item.quantity,
        name: productMap.get(item.productId).name,
      })),
    };

    // Generate Token
    const snapResponse = await snap.createTransaction(snapPayload);

    // Simpan token ke DB
    await db("transactions").where({ id: newTransaction.id }).update({
      midtrans_token: snapResponse.token,
      midtrans_redirect_url: snapResponse.redirect_url,
    });
    
    return {
      ...newTransaction,
      midtrans_token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
    };
  },

  async handleMidtransNotification(payload) {
    const { order_id, transaction_status, fraud_status } = payload;

    // 1. Tentukan Status Pembayaran
    let payment_status = "pending";
    if (
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement"
    ) {
      payment_status = "paid";
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      payment_status = "failed";
    }

    // 2. Update Status di Database
    // Kita perlu ambil data transaksi dulu untuk tahu user_id dan item-nya
    const transaction = await db("transactions").where({ payment_gateway_references: order_id }).first();
    
    if (!transaction) throw new Error("Transaction not found from webhook");

    // Update status pembayaran
    await Transaction.updatePaymentStatus(order_id, payment_status);

    // 3. 🔥 LOGIC BARU: MINTING HANYA JIKA PAID & BELUM ADA GARANSI 🔥
    if (payment_status === 'paid') {
        
        // Cek apakah garansi sudah pernah dibuat (biar gak double minting kalau webhook dikirim 2x)
        const existingWarranty = await db('digital_warranty').where({ transaction_id: transaction.id }).first();
        
        if (!existingWarranty) {
            console.log(`💰 Payment Paid for Order ${order_id}. Starting Minting...`);
            
            // Ambil item yang dibeli dari tabel detail
            const items = await db("transaction_details")
                .where({ transaction_id: transaction.id })
                .select('*');

            // Loop item dan minting satu-satu
            for (const item of items) {
                // Ambil info produk untuk durasi garansi
                const product = await Product.findById(item.product_id);
                const warrantyMonths = product.warranty_period_months || 12;

                // Generate SN & Expiry
                const serialNumber = `SN-${item.product_id}-${Date.now()}`;
                const expiryDate = Math.floor(Date.now() / 1000) + (warrantyMonths * 30 * 24 * 3600);

                try {
                    // A. Minting ke Blockchain
                    const txHash = await blockchainService.createWarranty(serialNumber, expiryDate);
                    
                    if (txHash) {
                        console.log(`✅ Minted! Hash: ${txHash}`);
                        
                        // B. Simpan Bukti ke Database
                        await Warranty.create({
                            transaction_id: transaction.id,
                            user_id: transaction.user_id,
                            product_id: item.product_id,
                            purchase_timestamp: new Date(),
                            warranty_period_months: warrantyMonths,
                            blockchain_tx_hash: txHash,
                            on_chain_status: 'confirmed',
                            status: 'active'
                        });
                    }
                } catch (err) {
                    console.error("❌ Minting Failed:", err);
                }
            }
        }
        
        // Update status order jadi completed/processing
        await Transaction.updateOrderStatus(order_id, 'completed');
    }

    return payment_status;
  },

  async getUserHistory(userId) {
    return await Transaction.findByUserId(userId);
  },

  async getTransactionDetail(transactionId, userId) {
    const data = await Transaction.findDetailById(transactionId, userId);
    if (!data) throw new Error("Transaction not found");
    return data;
  },
};

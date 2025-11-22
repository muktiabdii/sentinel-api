const Transaction = require("../models/transactionModel");
const Product = require("../models/productModel");
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

    // Blockchain Warranty (opsional)
    for (const itemDetail of transactionDetailsPayload) {
      const serialNumber = `SN-${itemDetail.product_id}-${Date.now()}`;
      const expiryDate = Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60;
      const txHash = await blockchainService.createWarranty(
        serialNumber,
        expiryDate
      );
      console.log(`Warranty Created: `, txHash);
    }

    return {
      ...newTransaction,
      midtrans_token: snapResponse.token,
      redirect_url: snapResponse.redirect_url,
    };
  },

  async handleMidtransNotification(payload) {
    const { order_id, transaction_status, fraud_status } = payload;

    let payment_status = "pending";
    if (
      (transaction_status === "capture" && fraud_status === "accept") ||
      transaction_status === "settlement"
    ) {
      payment_status = "paid";
    } else if (["deny", "cancel", "expire"].includes(transaction_status)) {
      payment_status = "failed";
    }

    // Update DB lewat model
    await Transaction.updatePaymentStatus(order_id, payment_status);

    if (payment_status === 'paid') {
    // 1 minute later -> in delivery
    setTimeout(async () => {
      try {
        await Transaction.updateOrderStatus(order_id, 'in delivery');

        // 1 minute later -> completed
        setTimeout(async () => {
          try {
            await Transaction.updateOrderStatus(order_id, 'completed');
            console.log(`Order ${order_id} status updated to "completed".`);
          } catch (err) {
            console.error(`Failed to update order ${order_id} to "completed":`, err);
          }
        }, 60 * 1000);

      } catch (err) {
        console.error(`Failed to update order ${order_id} to "in delivery":`, err);
      }
    }, 60 * 1000);
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

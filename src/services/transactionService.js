const Transaction = require("../models/transactionModel");
const Product = require("../models/productModel");
const Warranty = require("../models/warrantyModel");
const db = require("../config/db");
const blockchainService = require("./blockchainService");
const { snap } = require("./midtransService");

module.exports = {
  async createOrder(userId, { items, shipping_address, payment_method }) {
    if (!items || items.length === 0) throw new Error("Cart is empty");

    const cart = await Cart.findCartByUser(userId);
    if (!cart) throw new Error("Cart not found");

    const productIds = items.map((i) => i.productId);
    const products = await Product.findByIds(productIds);
    const productMap = new Map(products.map((p) => [p.id, p]));

    let totalAmount = 0;
    const transactionDetailsPayload = [];

    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 3);

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);

      const subtotal = parseFloat(product.price) * item.quantity;
      totalAmount += subtotal;

      transactionDetailsPayload.push({
        product_id: product.id,
        quantity: item.quantity,
        price_at_purchase: product.price,
        shipping_address: shipping_address,
        estimated_delivery: deliveryDate,
      });
    }

    const transactionPayload = {
      user_id: userId,
      total_amount: totalAmount,
      payment_status: "pending",
      order_status: "processing",
      payment_method,
      payment_gateway_references: `REF-${Date.now()}`,
    };

    const newTransaction = await Transaction.createTransaction(
      transactionPayload,
      transactionDetailsPayload
    );

    const snapPayload = {
      transaction_details: {
        order_id: newTransaction.payment_gateway_references,
        gross_amount: totalAmount,
      },
      customer_details: { user_id: userId, shipping_address },
      item_details: items.map((item) => ({
        id: item.productId,
        price: productMap.get(item.productId).price,
        quantity: item.quantity,
        name: productMap.get(item.productId).name,
      })),
    };

    const snapResponse = await snap.createTransaction(snapPayload);

    await db("transactions").where({ id: newTransaction.id }).update({
      midtrans_token: snapResponse.token,
      midtrans_redirect_url: snapResponse.redirect_url,
    });

    for (const item of items) {
      await Cart.deleteItem(cart.id, item.productId);
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

    const transaction = await db("transactions")
      .where({ payment_gateway_references: order_id })
      .first();
    if (!transaction) throw new Error("Transaction not found from webhook");

    await Transaction.updatePaymentStatus(order_id, payment_status);

    if (payment_status === "paid") {
      const existingWarranty = await db("digital_warranty")
        .where({ transaction_id: transaction.id })
        .first();

      if (!existingWarranty) {
        console.log(`💰 Paid. Minting...`);
        const items = await db("transaction_details")
          .where({ transaction_id: transaction.id })
          .select("*");

        for (const item of items) {
          const product = await Product.findById(item.product_id);
          const warrantyMonths = product.warranty_period_months || 12;
          const serialNumber = `SN-${item.product_id}-${Date.now()}`;
          const expiryDate =
            Math.floor(Date.now() / 1000) + warrantyMonths * 30 * 24 * 3600;

          try {
            const txHash = await blockchainService.createWarranty(
              serialNumber,
              expiryDate
            );
            if (txHash) {
              await Warranty.create({
                transaction_id: transaction.id,
                user_id: transaction.user_id,
                product_id: item.product_id,
                purchase_timestamp: new Date(),
                warranty_period_months: warrantyMonths,
                blockchain_tx_hash: txHash,
                on_chain_status: "confirmed",
                status: "active",
              });
            }
          } catch (err) {
            console.error("❌ Minting Failed:", err);
          }
        }
      }
      await Transaction.updateOrderStatus(order_id, "completed");
    }
    return payment_status;
  },

  async getUserHistory(userId) {
    const history = await Transaction.findByUserId(userId);

    return history.map((trx) => {
      const firstItem = trx.items[0] || {};
      let estimatedDelivery = firstItem.estimated_delivery;

      if (!estimatedDelivery && trx.created_at) {
        const orderDate = new Date(trx.created_at);
        orderDate.setDate(orderDate.getDate() + 3);
        estimatedDelivery = orderDate;
      }

      return {
        order_id: trx.id,
        payment_ref: trx.payment_gateway_references,
        order_date: trx.created_at,
        recipient_name: trx.user_name,
        payment_status: trx.payment_status,
        order_status: trx.order_status,
        total_payment: parseFloat(trx.total_amount),
        shipping_address: firstItem.shipping_address,
        estimated_delivery: estimatedDelivery,
        midtrans_token: trx.midtrans_token,
        midtrans_redirect_url: trx.midtrans_redirect_url,
        items: trx.items.map((item) => ({
          product_id: item.product_id || item.id,
          product_name: item.product_name,
          product_image: item.product_image,
          product_sku: item.product_sku,
          unit_price: parseFloat(item.price_at_purchase),
          quantity: item.quantity,
          subtotal: parseFloat(item.price_at_purchase) * item.quantity,
        })),
      };
    });
  },

  async getTransactionDetail(transactionId, userId) {
    const data = await Transaction.findDetailById(transactionId, userId);

    if (!data) throw new Error("Transaction not found");

    const firstItem = data.items[0] || {};
    let estimatedDelivery = firstItem.estimated_delivery;

    if (!estimatedDelivery) {
      const orderDate = new Date(data.created_at);
      orderDate.setDate(orderDate.getDate() + 3);
      estimatedDelivery = orderDate;
    }

    const formattedDetail = {
      order_id: data.id,
      payment_ref: data.payment_gateway_references,
      order_date: data.created_at,
      recipient_name: data.user_name,
      payment_status: data.payment_status,
      order_status: data.order_status,
      total_payment: parseFloat(data.total_amount),
      shipping_address: firstItem.shipping_address,
      estimated_delivery: estimatedDelivery,
      midtrans_token: data.midtrans_token,
      midtrans_redirect_url: data.midtrans_redirect_url,

      items: data.items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        product_sku: item.product_sku,
        unit_price: parseFloat(item.price_at_purchase),
        quantity: item.quantity,
        subtotal: parseFloat(item.price_at_purchase) * item.quantity,
      })),
    };

    return formattedDetail;
  },
};

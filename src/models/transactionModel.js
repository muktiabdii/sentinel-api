const db = require("../config/db");

const Transaction = {
  async createTransaction(transactionData, itemsData) {
    return db.transaction(async (trx) => {
      const [newTransaction] = await trx("transactions")
        .insert(transactionData)
        .returning(["id", "total_amount", "payment_status", "created_at", "payment_gateway_references"]);

      const detailsWithTxId = itemsData.map((item) => ({
        ...item,
        transaction_id: newTransaction.id,
      }));

      await trx("transaction_details").insert(detailsWithTxId);

      return newTransaction;
    });
  },

  async updatePaymentStatus(orderId, paymentStatus) {
    return db("transactions")
      .where({ payment_gateway_references: orderId })
      .update({ payment_status: paymentStatus });
  },

  async updateOrderStatus(orderId, orderStatus) {
    return db("transactions")
      .where({ payment_gateway_references: orderId })
      .update({ order_status: orderStatus });
  },

  async findByUserId(userId) {
    const transactions = await db("transactions")
      .join("users", "transactions.user_id", "users.id") 
      .select(
        "transactions.*",
        "users.name as user_name" 
      )
      .where({ "transactions.user_id": userId })
      .orderBy("transactions.created_at", "desc");

    if (!transactions.length) return [];

    const transactionIds = transactions.map(t => t.id);

    const items = await db("transaction_details")
      .join("products", "transaction_details.product_id", "products.id")
      .whereIn("transaction_id", transactionIds)
      .select(
        "transaction_details.id",
        "transaction_details.transaction_id",
        "transaction_details.quantity",
        "transaction_details.price_at_purchase",
        "transaction_details.shipping_address",
        "transaction_details.estimated_delivery",
        "products.name as product_name",
        "products.image as product_image",
        "products.sku as product_sku"
      );

    return transactions.map(trx => {
        const trxItems = items.filter(item => item.transaction_id === trx.id);
        return { ...trx, items: trxItems };
    });
  },

  async findDetailById(transactionId, userId) {
    const transaction = await db("transactions")
      .join("users", "transactions.user_id", "users.id") 
      .select(
        "transactions.*",
        "users.name as user_name"
      )
      .where({ "transactions.id": transactionId, "transactions.user_id": userId })
      .first();

    if (!transaction) return null;

    const items = await db("transaction_details")
      .join("products", "transaction_details.product_id", "products.id")
      .where({ transaction_id: transactionId })
      .select(
        "transaction_details.id",
        "transaction_details.quantity",
        "transaction_details.price_at_purchase",
        "transaction_details.shipping_address",
        "transaction_details.estimated_delivery",
        "products.name as product_name",
        "products.image as product_image",
        "products.sku as product_sku"
      );

    return { ...transaction, items };
  },
};

module.exports = Transaction;
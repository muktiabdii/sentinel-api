const db = require('../config/db');

const Transaction = {
  async createTransaction(transactionData, itemsData) {
    return db.transaction(async (trx) => {
      // insert ke tabel Header (Transactions)
      const [newTransaction] = await trx('transactions')
        .insert(transactionData)
        .returning(['id', 'total_amount', 'payment_status', 'created_at']);

      // siapkan data items dengan ID transaksi yang baru dibuat
      const detailsWithTxId = itemsData.map(item => ({
        ...item,
        transaction_id: newTransaction.id
      }));

      // insert ke tabel Detail (Transaction Details)
      await trx('transaction_details').insert(detailsWithTxId);

      return newTransaction;
    });
  },

  // ambil history transaksi user
  async findByUserId(userId) {
    return db('transactions')
      .where({ user_id: userId })
      .orderBy('created_at', 'desc');
  },

  // ambil detail lengkap transaksi (Header + Items)
  async findDetailById(transactionId, userId) {
    const transaction = await db('transactions')
      .where({ id: transactionId, user_id: userId })
      .first();

    if (!transaction) return null;

    const items = await db('transaction_details')
      .join('products', 'transaction_details.product_id', 'products.id')
      .where({ transaction_id: transactionId })
      .select(
        'transaction_details.*',
        'products.name as product_name',
        'products.image as product_image'
      );

    return { ...transaction, items };
  }
};

module.exports = Transaction;
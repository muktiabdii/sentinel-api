const db = require('../config/db');

const Warranty = {
  // Simpan data garansi baru (Kode lama kamu)
  async create(data) {
    return db('digital_warranty')
      .insert(data)
      .returning('*');
  },

  // 👇 TAMBAHAN BARU: Ambil semua garansi milik user tertentu
  async findAllByUserId(userId) {
    return db('digital_warranty')
      .join('products', 'digital_warranty.product_id', 'products.id')
      .select(
        'digital_warranty.id',
        'digital_warranty.blockchain_tx_hash',
        'digital_warranty.purchase_timestamp',
        'digital_warranty.warranty_period_months',
        'digital_warranty.status',
        'digital_warranty.on_chain_status',
        // Ambil info produk biar cantik di frontend
        'products.name as product_name',
        'products.image as product_image',
        'products.sku as product_sku'
      )
      .where({ 'digital_warranty.user_id': userId })
      .orderBy('digital_warranty.purchase_timestamp', 'desc');
  },

  // 👇 TAMBAHAN BARU: Ambil detail satu garansi (by ID)
  async findById(id) {
    return db('digital_warranty')
      .join('products', 'digital_warranty.product_id', 'products.id')
      .join('users', 'digital_warranty.user_id', 'users.id') // Join user juga buat validasi pemilik
      .select(
        'digital_warranty.*',
        'products.name as product_name',
        'products.image as product_image',
        'products.description as product_desc',
        'products.sku as product_sku',
        'users.name as owner_name',
        'users.email as owner_email'
      )
      .where({ 'digital_warranty.id': id })
      .first();
  },

  // 👇 TAMBAHAN BARU: Cari berdasarkan Serial Number / Hash (Untuk fitur Search/Scan QR)
  async findBySerialNumberOrHash(query) {
    return db('digital_warranty')
      .join('products', 'digital_warranty.product_id', 'products.id')
      .select(
        'digital_warranty.*',
        'products.name as product_name',
        'products.image as product_image'
      )
      // Cek apakah query cocok dengan Transaction Hash ATAU Serial Number (jika ada kolom SN)
      .where({ 'digital_warranty.blockchain_tx_hash': query }) 
      .first();
  }
};

module.exports = Warranty;
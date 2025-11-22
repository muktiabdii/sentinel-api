const Warranty = require('../models/warrantyModel');

module.exports = {
  async getMyWarranties(userId) {
    const warranties = await Warranty.findAllByUserId(userId);
    
    // Format data biar frontend enak bacanya (tambah info expiry date)
    return warranties.map(w => {
      const purchaseDate = new Date(w.purchase_timestamp);
      const expiryDate = new Date(purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + w.warranty_period_months);
      
      return {
        ...w,
        expiry_date: expiryDate, // Kirim tanggal habis garansi
        is_active: new Date() < expiryDate && w.status === 'active' // Cek status aktif real-time
      };
    });
  },

  async getWarrantyDetail(warrantyId, userId) {
    const warranty = await Warranty.findById(warrantyId);

    if (!warranty) {
      throw new Error('Warranty not found');
    }

    // Validasi: Pastikan yang akses adalah pemiliknya (Kecuali admin)
    // Jika kamu punya role admin, tambahkan logic || user.role === 'admin'
    if (warranty.user_id !== userId) {
        throw new Error('Unauthorized access to this warranty');
    }

    // Hitung Expired Date
    const purchaseDate = new Date(warranty.purchase_timestamp);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + warranty.warranty_period_months);

    // Hitung sisa hari
    const now = new Date();
    const diffTime = expiryDate - now;
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

    return {
      ...warranty,
      expiry_date: expiryDate,
      days_remaining: daysRemaining > 0 ? daysRemaining : 0,
      is_active: daysRemaining > 0 && warranty.status === 'active',
      explorer_url: `https://sepolia.etherscan.io/tx/${warranty.blockchain_tx_hash}` // Link ke blockchain
    };
  }
};
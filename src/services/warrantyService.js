const Warranty = require('../models/warrantyModel');
const blockchainService = require('./blockchainService');

module.exports = {
  async getMyWarranties(userId) {
    const warranties = await Warranty.findAllByUserId(userId);
    return warranties.map(w => {
      const purchaseDate = new Date(w.purchase_timestamp);
      const expiryDate = new Date(purchaseDate);
      expiryDate.setMonth(expiryDate.getMonth() + w.warranty_period_months);
      return {
        ...w,
        expiry_date: expiryDate, 
        is_active: new Date() < expiryDate && w.status === 'active' 
      };
    });
  },

  async getWarrantyDetail(warrantyId, userId) {
    // Ambil data dari Database Lokal
    const warranty = await Warranty.findById(warrantyId);

    if (!warranty) throw new Error('Warranty not found');

    // Hitung Expired Date 
    const purchaseDate = new Date(warranty.purchase_timestamp);
    const expiryDate = new Date(purchaseDate);
    expiryDate.setMonth(expiryDate.getMonth() + warranty.warranty_period_months);

    const now = new Date();
    const daysRemaining = Math.ceil((expiryDate - now) / (1000 * 60 * 60 * 24)); 

    // cek status real-time ke Sepolia menggunakan Hash yang tersimpan
    let blockchainInfo = {
        block_number: null,
        verified_on: null,
        network_status: 'Not Verified'
    };

    if (warranty.blockchain_tx_hash) {
        const liveData = await blockchainService.getTransactionDetails(warranty.blockchain_tx_hash);
        
        if (liveData) {
            // Konversi Unix Timestamp (detik) ke Format Tanggal JS
            const verifiedDate = new Date(liveData.timestamp * 1000);
            
            blockchainInfo = {
                block_number: liveData.blockNumber,
                verified_on: verifiedDate.toUTCString(), 
                verified_on_local: verifiedDate.toLocaleString(), 
                network_status: 'Verified on Sepolia'
            };
        }
    }

    // Gabungkan Data
    return {
      ...warranty,
      expiry_date: expiryDate,
      days_remaining: daysRemaining > 0 ? daysRemaining : 0,
      is_active: daysRemaining > 0 && warranty.status === 'active',
      explorer_url: `https://sepolia.etherscan.io/tx/${warranty.blockchain_tx_hash}`,
      
      // Masukkan data live blockchain disini
      blockchain_metadata: blockchainInfo 
    };
  }
};
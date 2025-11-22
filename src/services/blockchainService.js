const { ethers } = require('ethers');
require('dotenv').config();

// Load ABI dari file JSON
let contractABI;
try {
    contractABI = require('../config/abi.json'); 
} catch (error) {
    console.error("❌ Gagal load ABI. Pastikan file src/config/abi.json ada!", error);
    contractABI = []; 
}

// Inisialisasi Provider & Wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

// Inisialisasi Contract
const sentinelContract = new ethers.Contract(
    process.env.SMART_CONTRACT_ADDRESS,
    contractABI,
    wallet
);

module.exports = {
    // Buat Garansi (WRITE) - Membayar Gas Fee
    async createWarranty(serialNumber, expiryDate) {
        try {
            console.log(`🔗 [Blockchain] Memulai proses minting untuk SN: ${serialNumber}...`);
            
            // Panggil fungsi di Smart Contract
            const tx = await sentinelContract.createWarranty(serialNumber, expiryDate);
            
            console.log(`⏳ [Blockchain] Transaksi dikirim! Menunggu konfirmasi... Hash: ${tx.hash}`);
            
            // Tunggu transaksi selesai (mining)
            const receipt = await tx.wait();
            
            console.log(`✅ [Blockchain] Sukses! Tercatat di Block: ${receipt.blockNumber}`);
            
            return tx.hash; 
        } catch (error) {
            console.error("❌ [Blockchain Error]:", error.message);
            return null; 
        }
    },

    // Ambil Detail Transaksi (READ)
    async getTransactionDetails(txHash) {
        try {
            if (!txHash) return null;

            // Ambil Data Transaksi
            const tx = await provider.getTransaction(txHash);
            if (!tx) return null; 

            // Ambil Data Block (untuk dapat waktu mining yang akurat)
            const block = await provider.getBlock(tx.blockNumber);

            return {
                blockNumber: tx.blockNumber,
                timestamp: block.timestamp, 
                from: tx.from,
                status: "Confirmed"
            };
        } catch (error) {
            console.error("⚠️ Gagal ambil info blockchain:", error.message);
            return null;
        }
    }
};
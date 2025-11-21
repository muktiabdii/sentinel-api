const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// 1. Setup Konfigurasi
const abiPath = path.join(__dirname, '../config/abi.json');
let contractABI;

try {
    contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
} catch (error) {
    console.error("❌ Gagal membaca file ABI. Pastikan src/config/abi.json ada!");
    contractABI = []; 
}

// 2. Inisialisasi Provider & Wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);

// 3. Inisialisasi Contract
const sentinelContract = new ethers.Contract(
    process.env.SMART_CONTRACT_ADDRESS,
    contractABI,
    wallet
);

module.exports = {
    async createWarranty(serialNumber, expiryDate) {
        try {
            console.log(`🔗 [Blockchain] Memulai proses minting untuk SN: ${serialNumber}...`);
            
            // Panggil fungsi di Smart Contract
            const tx = await sentinelContract.createWarranty(serialNumber, expiryDate);
            
            console.log(`⏳ [Blockchain] Transaksi dikirim! Menunggu konfirmasi... Hash: ${tx.hash}`);
            
            // Tunggu transaksi selesai (mining)
            const receipt = await tx.wait();
            
            console.log(`✅ [Blockchain] Sukses! Tercatat di Block: ${receipt.blockNumber}`);
            
            return tx.hash; // Kembalikan hash buat disimpan di DB
        } catch (error) {
            console.error("❌ [Blockchain Error]:", error.message);
            return null; 
        }
    }
};
const User = require("../models/userModel");

module.exports = {
  // Cuma butuh ini kan? Ambil data user.
  async getProfile(userId) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new Error("User not found");
    }

    // Hapus password biar aman saat dikirim ke frontend
    delete user.password; 
    
    return user;
  },

  // Kalau misal mau edit data teks (Nama/HP) tanpa ganti foto:
  async editProfile(userId, data) {
    // Langsung update ke DB tanpa urusan upload
    const updated = await User.update(userId, data);
    delete updated.password;
    return updated;
  }
};
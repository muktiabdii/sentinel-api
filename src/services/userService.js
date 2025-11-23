const User = require('../models/User');
const cloudinaryService = require('./cloudinaryService');

module.exports = {
    async getProfile(userId) {
        return await User.findById(userId);
    },

    async editProfile(userId, data, file) {
    const updateData = { ...data };

    // Handle password update
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(data.password, salt);
    } else {
      delete updateData.password;
    }

    // Upload photo to Cloudinary if exists
    if (file) {
      const upload = await cloudinary.uploader.upload_stream(
        { folder: "profile_pictures" },
        (error, result) => {
          if (error) throw new Error("Cloudinary upload failed");
        }
      );

      // Convert buffer to stream
      const stream = cloudinary.uploader.upload_stream(
        { folder: "profile_pictures" },
        async (err, result) => {
          if (err) throw new Error("Failed to upload image");

          updateData.profile_picture = result.secure_url;

          // Update database after upload succeeds
          return await User.update(userId, updateData);
        }
      );

      stream.end(file.buffer);

      // ⛔ return dulu supaya nggak double execute
      return new Promise((resolve, reject) => {
        stream.on("finish", async () => {
          try {
            const updated = await User.findById(userId);
            resolve(updated);
          } catch (err) {
            reject(err);
          }
        });
      });
    }

    // Update DB normally if no image uploaded
    return await User.update(userId, updateData);
  }
};
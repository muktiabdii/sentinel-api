const userService = require('../services/userService');

module.exports = {
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const profile = await userService.getProfile(userId);
      res.json({ data: profile });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async editProfile(req, res) {
    try {
      const userId = req.user.id;

      const updatedUser = await userService.editProfile(
        userId,
        req.body,
        req.file
      );

      res.json({ 
        message: "Profile updated successfully",
        data: updatedUser
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}
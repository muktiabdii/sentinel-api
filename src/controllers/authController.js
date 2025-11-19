const authService = require('../services/authService');

module.exports = {
  async register(req, res) {
    try {
      const { name, email, password, phone_number } = req.body;

      const user = await authService.register({
        name,
        email,
        password,
        phone: phone_number,
      });

      res.status(201).json({
        message: 'User registered successfully',
        user
      });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const data = await authService.login({ email, password });

      res.json({
        message: 'Login successful',
        ...data
      });
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  }
};

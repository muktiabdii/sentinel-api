const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { jwt: jwtConfig } = require('../config/env');

module.exports = {
  async register({ name, email, password, phone }) {
    // cek email
    const existing = await User.findByEmail(email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const hashed = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashed,
      phone_number: phone,
    });

    return newUser[0];
  },

  async login({ email, password }) {
    const user = await User.findByEmail(email);
    if (!user) throw new Error('Invalid email or password');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Invalid email or password');

    const token = jwt.sign(
      { id: user.id, email: user.email },
      jwtConfig.secret,
      { expiresIn: jwtConfig.expiresIn }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  }
};

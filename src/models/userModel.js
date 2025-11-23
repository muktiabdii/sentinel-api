const db = require('../config/db');

const User = {
  async findByEmail(email) {
    return db('users').where({ email }).first();
  },

  async findById(id) {
    return db('users').where({ id }).first();
  },

  async create(userData) {
    return db('users')
      .insert(userData)
      .returning(['id', 'name', 'email', 'phone_number', 'profile_picture']);
  },

  async update(userId, data) {
    const [updated] = await db("users")
      .where({ id: userId })
      .update(data)
      .returning(["id", "name", "email", "phone_number", "profile_picture"]);

    return updated;
  }
};

module.exports = User;

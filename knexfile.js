const env = require('./src/config/env.js');

module.exports = {
  development: {
    client: 'pg',
    connection: env.DB_URL || env.db?.connectionString || env.db?.url,
    migrations: {
      directory: './src/database/migrations',
    },
  },
};

const env = require('./src/config/env.js');

module.exports = {
  development: {
    client: 'pg',
    connection: env.db.url,
    migrations: {
      directory: './src/database/migrations',
    },
  },
};

const knex = require('knex');
const { db } = require('./env.js');

const knexInstance = knex({
  client: 'pg',
  connection: 
  {
    host: db.host,
    user: db.user,
    password: db.password,
    database: db.database,
    port: db.port,
  },
  pool: { min: 0, max: 10 },
  searchPath: ['sentinel'],
});

module.exports = knexInstance;

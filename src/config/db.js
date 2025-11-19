const knex = require('knex');
const { db } = require('./env');

const knexInstance = knex({
  client: 'pg',
  connection: db.url, 
  pool: { min: 0, max: 10 },
});

module.exports = knexInstance;

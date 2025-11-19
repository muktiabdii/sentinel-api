const db = require('./src/config/db');

db.raw('SELECT 1+1 AS result')
  .then(res => {
    console.log('DB OK:', res.rows);
    process.exit();
  })
  .catch(err => {
    console.error('DB ERROR:', err);
    process.exit();
  });

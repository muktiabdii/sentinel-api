require('dotenv').config(); 

const dbUrl = process.env.DB_URL;

if (!dbUrl) {
  console.error('❌ ERROR: DATABASE_URL tidak ditemukan di file .env');
  process.exit(1);
}

// Setup Knex dengan SSL
const knex = require('knex')({
  client: 'pg',
  connection: {
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false } 
  },
  searchPath: ['knex', 'public'],
});

async function cleanData() {
  try {
    console.log('🔄 Connecting to Railway Database (with SSL)...');
    
    // Tes koneksi 
    await knex.raw('SELECT 1');
    console.log('✅ Connected successfully!');

    console.log('🗑️  Mulai menghapus data dummy...');

    // ID produk 
    const ids = [10, 11, 12];

    // 1. Hapus Transaction Details
    const deletedTrans = await knex('transaction_details').whereIn('product_id', ids).del();
    console.log(`- Deleted ${deletedTrans} rows from transaction_details`);

    // 2. Hapus Cart Items 
    try {
      const deletedCart = await knex('cart_items').whereIn('product_id', ids).del();
      console.log(`- Deleted ${deletedCart} rows from cart_items`);
    } catch (e) {
      console.log('- cart_items table skipped or empty');
    }

    // 3. Hapus Digital Warranty
    try {
      const deletedWar = await knex('digital_warranty').whereIn('product_id', ids).del();
      console.log(`- Deleted ${deletedWar} rows from digital_warranty`);
    } catch (e) { 
       try {
         const deletedWar2 = await knex('warranties').whereIn('product_id', ids).del();
         console.log(`- Deleted ${deletedWar2} rows from warranties`);
       } catch(ex) {
         console.log(`- Skip warranty deletion: ${e.message}`);
       }
    }

    // 4. Hapus Products
    const deletedProd = await knex('products').whereIn('id', ids).del();
    console.log(`- Deleted ${deletedProd} rows from products`);

    console.log('🎉 CLEANUP SUCCESS! Data dummy sudah bersih.');
    process.exit(0);
  } catch (err) {
    console.error('❌ ERROR DETAIL:', err.message);
    process.exit(1);
  }
}

cleanData();
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkProduct6() {
  try {
    const result = await pool.query('SELECT * FROM product_variants WHERE product_id = 6 ORDER BY color, size');
    console.log('\n📦 VARIANTES DEL PRODUCTO 6 (Ballistic Helmet):\n');
    
    if (result.rows.length === 0) {
      console.log('❌ No tiene variantes\n');
    } else {
      result.rows.forEach(row => {
        console.log(`   Color: ${row.color || 'N/A'} | Talla: ${row.size || 'N/A'} | SKU: ${row.sku_variant}`);
      });
      console.log(`\nTotal: ${result.rows.length} variantes\n`);
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkProduct6();

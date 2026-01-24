const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkClients() {
  try {
    const result = await pool.query('SELECT id, company_name, active FROM clients ORDER BY company_name');
    console.log('\n📊 CLIENTES EN LA BASE DE DATOS:\n');
    if (result.rows.length === 0) {
      console.log('❌ No hay clientes en la base de datos');
    } else {
      result.rows.forEach(row => {
        console.log(`   ID: ${row.id} | ${row.company_name} | ${row.active ? 'Activo' : 'Inactivo'}`);
      });
    }
    console.log(`\nTotal: ${result.rows.length} clientes\n`);
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkClients();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkUsersTable() {
  try {
    // Ver la estructura de la tabla users
    const columnsResult = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 ESTRUCTURA DE LA TABLA USERS:\n');
    columnsResult.rows.forEach(col => {
      console.log(`   ${col.column_name} (${col.data_type})`);
    });

    // Mostrar un usuario de ejemplo
    const userResult = await pool.query('SELECT * FROM users LIMIT 1');
    if (userResult.rows.length > 0) {
      console.log('\n👤 USUARIO DE EJEMPLO:\n');
      console.log(JSON.stringify(userResult.rows[0], null, 2));
    }

    console.log('');
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

checkUsersTable();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function listAllUsers() {
  try {
    const result = await pool.query(`
      SELECT u.id, u.user_name, u.name, u.email, u.role, c.company_name 
      FROM users u
      LEFT JOIN clients c ON u.client_id = c.id
      ORDER BY u.id
    `);
    
    console.log('\n📋 TODOS LOS USUARIOS:\n');
    result.rows.forEach(user => {
      console.log(`ID: ${user.id}`);
      console.log(`  Usuario: ${user.user_name}`);
      console.log(`  Nombre: ${user.name || 'N/A'}`);
      console.log(`  Email: ${user.email || 'N/A'}`);
      console.log(`  Rol: ${user.role}`);
      console.log(`  Cliente: ${user.company_name || 'N/A (Admin)'}`);
      console.log('');
    });
    
    console.log(`Total: ${result.rows.length} usuarios\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

listAllUsers();

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createK9User() {
  console.log('👤 CREANDO USUARIO PARA K-9 INTERNACIONAL\n');

  try {
    // Encriptar contraseña
    const password = await bcrypt.hash('k9pass123', 10);

    // Insertar usuario
    const result = await pool.query(
      `INSERT INTO users (client_id, user_name, name, email, password, role, active)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, user_name, name, email, role`,
      [
        4, // K-9 Internacional (ID: 4)
        'k9_user',
        'Usuario K-9',
        'usuario@k9internacional.com',
        password,
        'client_user',
        true
      ]
    );

    console.log('✅ Usuario creado exitosamente:\n');
    console.log(result.rows[0]);
    console.log('\n📝 CREDENCIALES:');
    console.log('   Usuario: k9_user');
    console.log('   Contraseña: k9pass123\n');

  } catch (error) {
    if (error.code === '23505') {
      console.log('⚠️  El usuario k9_user ya existe\n');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    await pool.end();
  }
}

createK9User();

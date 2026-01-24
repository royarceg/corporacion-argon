// =====================================================
// SCRIPT PARA ACTUALIZAR CONTRASEÑAS EN LA BD
// =====================================================

const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function updatePasswords() {
  try {
    console.log('Conectando a la base de datos...\n');

    // Generar hash para admin123
    const adminHash = await bcrypt.hash('admin123', 10);
    console.log('✓ Hash generado para admin123');

    // Generar hash para password123
    const clientHash = await bcrypt.hash('password123', 10);
    console.log('✓ Hash generado para password123\n');

    // Actualizar contraseña del admin
    await pool.query(
      `UPDATE users SET password = $1 WHERE user_name = 'admin_master'`,
      [adminHash]
    );
    console.log('✓ Contraseña actualizada para: admin_master');

    // Actualizar contraseñas de todos los clientes
    const clientUsers = [
      'carnes_doradas',
      'wendell_montero', 
      'finca_8_del_norte',
      'francisco_gutierrez',
      'carolina_sibaja',
      'christian_asi'
    ];

    for (const username of clientUsers) {
      await pool.query(
        `UPDATE users SET password = $1 WHERE user_name = $2`,
        [clientHash, username]
      );
      console.log(`✓ Contraseña actualizada para: ${username}`);
    }

    console.log('\n✅ TODAS LAS CONTRASEÑAS HAN SIDO ACTUALIZADAS\n');
    console.log('Credenciales de acceso:');
    console.log('  Admin: admin_master / admin123');
    console.log('  Clientes: [nombre_usuario] / password123\n');

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

updatePasswords();

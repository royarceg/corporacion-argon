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

async function setup() {
  console.log('🚀 Iniciando configuración de la base de datos...\n');

  try {
    // 1. Generar hashes de contraseñas
    console.log('🔐 Generando hashes de contraseñas...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const clientPassword = await bcrypt.hash('password123', 10);
    console.log('✅ Hashes generados\n');

    // 2. Actualizar contraseña del admin
    console.log('👤 Actualizando contraseña de admin...');
    await pool.query(
      `UPDATE users SET password = $1 WHERE user_name = 'admin_master'`,
      [adminPassword]
    );
    console.log('✅ Contraseña de admin actualizada\n');

    // 3. Actualizar contraseñas de clientes
    console.log('👥 Actualizando contraseñas de clientes...');
    await pool.query(
      `UPDATE users SET password = $1 WHERE role = 'client_user'`,
      [clientPassword]
    );
    console.log('✅ Contraseñas de clientes actualizadas\n');

    // 4. Verificar usuarios creados
    console.log('📋 Verificando usuarios creados:');
    const result = await pool.query('SELECT user_name, role FROM users ORDER BY id');
    result.rows.forEach(user => {
      console.log(`  - ${user.user_name} (${user.role})`);
    });

    console.log('\n✅ ¡Configuración completada exitosamente!\n');
    console.log('📝 Credenciales de acceso:\n');
    console.log('Admin:');
    console.log('  Usuario: admin_master');
    console.log('  Contraseña: admin123\n');
    console.log('Clientes:');
    console.log('  Usuario: carnes_doradas, wendell_montero, etc.');
    console.log('  Contraseña: password123\n');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error);
  } finally {
    await pool.end();
  }
}

setup();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addNameColumn() {
  try {
    console.log('\n🔧 AGREGANDO COLUMNA NAME A LA TABLA USERS...\n');

    // Agregar columna name
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255)
    `);

    console.log('✅ Columna "name" agregada exitosamente\n');

    // Actualizar nombres de usuarios existentes basados en user_name
    await pool.query(`
      UPDATE users 
      SET name = CASE 
        WHEN user_name = 'admin_master' THEN 'Administrador'
        WHEN user_name = 'wendell_montero' THEN 'Wendell Montero'
        WHEN user_name = 'carnes_doradas' THEN 'Carnes Doradas'
        ELSE INITCAP(REPLACE(user_name, '_', ' '))
      END
      WHERE name IS NULL
    `);

    console.log('✅ Nombres actualizados para usuarios existentes\n');

    // Mostrar usuarios actualizados
    const result = await pool.query('SELECT id, user_name, name, email, role FROM users ORDER BY id');
    console.log('👥 USUARIOS ACTUALIZADOS:\n');
    result.rows.forEach(user => {
      console.log(`   ID: ${user.id} | ${user.user_name} → "${user.name}" | ${user.role}`);
    });
    console.log('');

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await pool.end();
  }
}

addNameColumn();

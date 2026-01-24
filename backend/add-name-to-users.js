// Script para agregar la columna 'name' a la tabla users si no existe
const pool = require('./src/config/database');

async function addNameColumn() {
  try {
    console.log('🔧 Verificando estructura de la tabla users...\n');

    // Verificar si la columna 'name' existe
    const checkColumn = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'name'
    `);

    if (checkColumn.rows.length > 0) {
      console.log('✅ La columna "name" ya existe en la tabla users');
    } else {
      console.log('⚠️  La columna "name" no existe. Agregándola...');
      
      // Agregar la columna
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN name VARCHAR(255)
      `);
      
      console.log('✅ Columna "name" agregada exitosamente\n');
    }

    // Mostrar estructura actualizada
    console.log('📋 Estructura actual de la tabla users:');
    const columns = await pool.query(`
      SELECT column_name, data_type, character_maximum_length, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);

    columns.rows.forEach(col => {
      const length = col.character_maximum_length ? `(${col.character_maximum_length})` : '';
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      console.log(`   ${col.column_name} (${col.data_type}${length}) ${nullable}`);
    });

    console.log('\n✅ Proceso completado');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addNameColumn();

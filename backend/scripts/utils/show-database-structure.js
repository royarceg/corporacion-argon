// =====================================================
// SCRIPT PARA VER LA ESTRUCTURA DE LA BASE DE DATOS
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function showDatabaseStructure() {
  try {
    console.log('\n📊 ESTRUCTURA DE LA BASE DE DATOS\n');
    console.log('='.repeat(120));

    // Obtener todas las tablas
    const tablesResult = await pool.query(`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    for (const table of tablesResult.rows) {
      const tableName = table.tablename;
      
      console.log(`\n🗄️  TABLA: ${tableName.toUpperCase()}`);
      console.log('-'.repeat(120));

      // Obtener columnas de la tabla
      const columnsResult = await pool.query(`
        SELECT 
          column_name,
          data_type,
          character_maximum_length,
          is_nullable,
          column_default
        FROM information_schema.columns
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [tableName]);

      console.log('Columna'.padEnd(30) + 'Tipo'.padEnd(25) + 'Nulo?'.padEnd(10) + 'Default');
      console.log('-'.repeat(120));

      for (const col of columnsResult.rows) {
        let tipo = col.data_type;
        if (col.character_maximum_length) {
          tipo += `(${col.character_maximum_length})`;
        }
        
        const colName = col.column_name.padEnd(30);
        const colType = tipo.padEnd(25);
        const nullable = col.is_nullable.padEnd(10);
        const defaultVal = col.column_default || '';

        console.log(`${colName}${colType}${nullable}${defaultVal}`);
      }

      // Obtener constraints (primary keys, foreign keys, unique)
      const constraintsResult = await pool.query(`
        SELECT
          tc.constraint_name,
          tc.constraint_type,
          kcu.column_name,
          ccu.table_name AS foreign_table_name,
          ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
        LEFT JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_name = $1
        ORDER BY tc.constraint_type, tc.constraint_name
      `, [tableName]);

      if (constraintsResult.rows.length > 0) {
        console.log('\n📌 Constraints:');
        for (const constraint of constraintsResult.rows) {
          let desc = `   • ${constraint.constraint_type}: ${constraint.column_name}`;
          if (constraint.foreign_table_name) {
            desc += ` → ${constraint.foreign_table_name}(${constraint.foreign_column_name})`;
          }
          console.log(desc);
        }
      }

      console.log('');
    }

    console.log('='.repeat(120));
    console.log(`\nTotal de tablas: ${tablesResult.rows.length}\n`);

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

showDatabaseStructure();

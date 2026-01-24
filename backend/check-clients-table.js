const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function checkClientsTable() {
  try {
    // Verificar si existe la tabla clients
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'clients'
      );
    `);

    if (!tableCheck.rows[0].exists) {
      console.log('❌ La tabla "clients" NO existe en la base de datos\n');
      console.log('Necesitas crear la tabla clients. ¿Quieres que te genere el SQL?\n');
    } else {
      console.log('✅ La tabla "clients" existe\n');
      
      // Ver la estructura de la tabla
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'clients'
        ORDER BY ordinal_position;
      `);

      console.log('📋 ESTRUCTURA DE LA TABLA CLIENTS:\n');
      columnsResult.rows.forEach(col => {
        console.log(`   ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? '- NOT NULL' : ''}`);
      });
      console.log('');

      // Ver cuántos clientes hay
      const countResult = await pool.query('SELECT COUNT(*) FROM clients');
      console.log(`📊 Total de clientes: ${countResult.rows[0].count}\n`);

      // Mostrar algunos clientes
      if (parseInt(countResult.rows[0].count) > 0) {
        const clientsResult = await pool.query('SELECT * FROM clients LIMIT 5');
        console.log('👥 PRIMEROS CLIENTES:\n');
        clientsResult.rows.forEach(client => {
          console.log(`   ID: ${client.id} | ${client.company_name || client.name || 'Sin nombre'}`);
        });
        console.log('');
      }
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nDetalle del error:', error);
    await pool.end();
  }
}

checkClientsTable();

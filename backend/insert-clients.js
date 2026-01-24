// =====================================================
// SCRIPT PARA INSERTAR CLIENTES EN LA BASE DE DATOS
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

async function insertClients() {
  try {
    console.log('\n🔧 INSERTANDO CLIENTES...\n');

    const clients = [
      {
        company_name: 'COMINSA S.A.',
        contact_name: 'Juan Pérez',
        email: 'juan@cominsa.com',
        phone: '+506 2222-3333',
        address: 'San José, Costa Rica'
      },
      {
        company_name: 'Finca 8 del Norte',
        contact_name: 'María González',
        email: 'maria@finca8.com',
        phone: '+506 2444-5555',
        address: 'Alajuela, Costa Rica'
      },
      {
        company_name: 'Francisco Gutierrez',
        contact_name: 'Francisco Gutierrez',
        email: 'francisco@gmail.com',
        phone: '+506 8888-9999',
        address: 'Heredia, Costa Rica'
      },
      {
        company_name: 'Carolina Sibaja',
        contact_name: 'Carolina Sibaja',
        email: 'carolina@gmail.com',
        phone: '+506 7777-6666',
        address: 'Cartago, Costa Rica'
      },
      {
        company_name: 'Christian ASI',
        contact_name: 'Christian Mora',
        email: 'christian@asi.com',
        phone: '+506 6666-5555',
        address: 'San José, Costa Rica'
      },
      {
        company_name: 'Wendell Montero',
        contact_name: 'Wendell Montero',
        email: 'wendell@gmail.com',
        phone: '+506 5555-4444',
        address: 'Puntarenas, Costa Rica'
      }
    ];

    for (const client of clients) {
      // Verificar si ya existe el cliente
      const existingResult = await pool.query(
        `SELECT id FROM clients WHERE company_name = $1`,
        [client.company_name]
      );

      if (existingResult.rows.length === 0) {
        // Insertar cliente
        const result = await pool.query(
          `INSERT INTO clients (company_name, contact_name, email, phone, address, active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING id`,
          [client.company_name, client.contact_name, client.email, client.phone, client.address]
        );
        console.log(`✓ Cliente insertado: ${client.company_name} (ID: ${result.rows[0].id})`);
      } else {
        console.log(`- Ya existe: ${client.company_name} (ID: ${existingResult.rows[0].id})`);
      }
    }

    console.log('\n✅ CLIENTES INSERTADOS\n');

    // Mostrar resumen
    const summaryResult = await pool.query(`
      SELECT 
        id,
        company_name,
        contact_name,
        email,
        active
      FROM clients
      ORDER BY company_name
    `);

    console.log('📊 LISTA DE CLIENTES:\n');
    summaryResult.rows.forEach(row => {
      console.log(`   ID: ${row.id} | ${row.company_name} | ${row.contact_name} | ${row.email} | ${row.active ? 'Activo' : 'Inactivo'}`);
    });
    console.log('');

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

insertClients();

// =====================================================
// SCRIPT PARA ASIGNAR TODOS LOS PRODUCTOS A TODOS LOS CLIENTES
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

async function assignProductsToClients() {
  try {
    console.log('\n🔧 ASIGNANDO TODOS LOS PRODUCTOS A TODOS LOS CLIENTES...\n');

    // Obtener todos los clientes
    const clientsResult = await pool.query(`
      SELECT id, company_name 
      FROM clients 
      WHERE active = true
    `);

    // Obtener todos los productos activos
    const productsResult = await pool.query(`
      SELECT id, name 
      FROM products 
      WHERE active = true
    `);

    console.log(`📊 Clientes: ${clientsResult.rows.length}`);
    console.log(`📦 Productos: ${productsResult.rows.length}\n`);

    for (const client of clientsResult.rows) {
      console.log(`\n👤 Procesando cliente: ${client.company_name}`);
      
      for (const product of productsResult.rows) {
        // Verificar si ya existe la asignación
        const existingResult = await pool.query(`
          SELECT id FROM client_products 
          WHERE client_id = $1 AND product_id = $2
        `, [client.id, product.id]);

        if (existingResult.rows.length === 0) {
          // Insertar asignación
          await pool.query(`
            INSERT INTO client_products (client_id, product_id, active)
            VALUES ($1, $2, true)
          `, [client.id, product.id]);
          console.log(`   ✓ Asignado: ${product.name}`);
        } else {
          console.log(`   - Ya asignado: ${product.name}`);
        }
      }
    }

    console.log('\n✅ ASIGNACIÓN COMPLETADA\n');

    // Mostrar resumen
    const summaryResult = await pool.query(`
      SELECT 
        c.company_name,
        COUNT(cp.id) as total_productos
      FROM clients c
      LEFT JOIN client_products cp ON c.id = cp.client_id
      WHERE c.active = true
      GROUP BY c.id, c.company_name
      ORDER BY c.company_name
    `);

    console.log('📊 RESUMEN POR CLIENTE:\n');
    summaryResult.rows.forEach(row => {
      console.log(`   ${row.company_name}: ${row.total_productos} productos`);
    });
    console.log('');

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

assignProductsToClients();

const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function addVariantGroupColumn() {
  console.log('🔧 AGREGANDO COLUMNA variant_group A LA TABLA products\n');

  try {
    // 1. Agregar columna variant_group
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS variant_group VARCHAR(100)
    `);
    console.log('✅ Columna variant_group agregada\n');

    // 2. Actualizar productos existentes ZAP-01 y ZAP-02
    await pool.query(`
      UPDATE products 
      SET variant_group = 'ZAP' 
      WHERE sku IN ('ZAP-01', 'ZAP-02')
    `);
    console.log('✅ ZAP-01 y ZAP-02 actualizados con variant_group = "ZAP"\n');

    // 3. Verificar los cambios
    const result = await pool.query(`
      SELECT id, sku, name, variant_group 
      FROM products 
      WHERE sku IN ('ZAP-01', 'ZAP-02')
      ORDER BY sku
    `);

    console.log('📋 PRODUCTOS ACTUALIZADOS:\n');
    result.rows.forEach(row => {
      console.log(`  SKU: ${row.sku}`);
      console.log(`  Nombre: ${row.name.substring(0, 50)}...`);
      console.log(`  Variant Group: ${row.variant_group}`);
      console.log('');
    });

    console.log('🎉 ACTUALIZACIÓN COMPLETADA\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

addVariantGroupColumn();

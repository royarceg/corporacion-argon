// =====================================================
// SCRIPT PARA LIMPIAR PRODUCTOS SIN IMÁGENES
// Elimina productos que no tienen imágenes asociadas
// =====================================================

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function cleanProductsWithoutImages() {
  console.log('🧹 LIMPIANDO PRODUCTOS SIN IMÁGENES\n');

  try {
    // Encontrar productos sin imágenes
    const result = await pool.query(`
      SELECT p.id, p.sku, p.name
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE pi.id IS NULL
      ORDER BY p.id
    `);

    console.log(`📦 Productos sin imágenes encontrados: ${result.rows.length}\n`);

    if (result.rows.length === 0) {
      console.log('✅ No hay productos para limpiar.\n');
      return;
    }

    // Mostrar productos a eliminar
    console.log('Productos que serán eliminados:');
    result.rows.forEach(p => {
      console.log(`  • ID ${p.id}: ${p.sku} - ${p.name.substring(0, 50)}...`);
    });

    console.log('\n⚠️  Eliminando productos...\n');

    // Eliminar cada producto (las tablas relacionadas se limpiarán por CASCADE)
    for (const product of result.rows) {
      await pool.query('DELETE FROM products WHERE id = $1', [product.id]);
      console.log(`  ✅ Eliminado: ${product.sku} (ID: ${product.id})`);
    }

    console.log(`\n🎉 Se eliminaron ${result.rows.length} productos sin imágenes.\n`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanProductsWithoutImages();

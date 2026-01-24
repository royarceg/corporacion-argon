// =====================================================
// SCRIPT PARA AGREGAR VARIANTES A TODOS LOS PRODUCTOS
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

async function addVariantsToAllProducts() {
  try {
    console.log('\n🔧 AGREGANDO VARIANTES A TODOS LOS PRODUCTOS...\n');

    // Obtener todos los productos
    const productsResult = await pool.query(`
      SELECT id, sku, name, category
      FROM products
      WHERE active = true
      ORDER BY id
    `);

    for (const product of productsResult.rows) {
      console.log(`\n📦 Procesando: ${product.name} (SKU: ${product.sku})`);

      // Verificar si ya tiene variantes
      const existingVariants = await pool.query(`
        SELECT COUNT(*) as count
        FROM product_variants
        WHERE product_id = $1
      `, [product.id]);

      if (parseInt(existingVariants.rows[0].count) > 0) {
        console.log(`   ✓ Ya tiene ${existingVariants.rows[0].count} variantes - saltando`);
        continue;
      }

      // Definir variantes según categoría
      let variants = [];

      // Productos con tallas (Uniformes, Camisas, Pantalones, Chalecos)
      if (['Uniformes', 'Camisas', 'Pantalones', 'Chalecos'].includes(product.category)) {
        const colors = ['Negro', 'Azul', 'Gris'];
        const sizes = ['S', 'M', 'L', 'XL'];
        
        for (const color of colors) {
          for (const size of sizes) {
            variants.push({
              color,
              size,
              sku_variant: `${product.sku}-${color.toUpperCase()}-${size}`
            });
          }
        }
      }
      // Accesorios (talla única)
      else if (product.category === 'Accesorios') {
        const colors = ['Negro', 'Azul', 'Rojo'];
        
        for (const color of colors) {
          variants.push({
            color,
            size: 'Unica',
            sku_variant: `${product.sku}-${color.toUpperCase()}-UNI`
          });
        }
      }
      // Otros productos (talla única, un solo color)
      else {
        variants.push({
          color: 'Estandar',
          size: 'Unica',
          sku_variant: `${product.sku}-STD-UNI`
        });
      }

      // Insertar variantes (SIN campo stock_quantity)
      for (const variant of variants) {
        await pool.query(`
          INSERT INTO product_variants (product_id, color, size, sku_variant, active)
          VALUES ($1, $2, $3, $4, true)
        `, [product.id, variant.color, variant.size, variant.sku_variant]);
      }

      console.log(`   ✓ Agregadas ${variants.length} variantes`);
    }

    console.log('\n✅ VARIANTES AGREGADAS EXITOSAMENTE\n');

    // Mostrar resumen
    const summary = await pool.query(`
      SELECT 
        p.name,
        COUNT(pv.id) as total_variantes
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      WHERE p.active = true
      GROUP BY p.id, p.name
      ORDER BY p.id
    `);

    console.log('📊 RESUMEN:\n');
    summary.rows.forEach(row => {
      console.log(`   ${row.name}: ${row.total_variantes} variantes`);
    });
    console.log('');

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
    process.exit(1);
  }
}

addVariantsToAllProducts();

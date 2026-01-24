// =====================================================
// SCRIPT PARA IMPORTAR PRODUCTOS DESDE CSV
// =====================================================

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Función para parsear CSV
function parseCSV(text) {
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let char of lines[i]) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    rows.push(row);
  }

  return rows;
}

async function importProductsFromCSV() {
  try {
    console.log('\n📥 IMPORTANDO PRODUCTOS DESDE CSV...\n');

    // Leer archivo CSV
    const csvPath = path.join(__dirname, 'productos_import.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('❌ Error: No se encontró el archivo productos_import.csv');
      console.log('\n💡 Instrucciones:');
      console.log('   1. Ejecuta: node view-products.js');
      console.log('   2. Renombra productos_export.csv a productos_import.csv');
      console.log('   3. Edita productos_import.csv en Excel');
      console.log('   4. Ejecuta: node import-products.js\n');
      process.exit(1);
    }

    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const products = parseCSV(csvContent);

    console.log(`📊 Productos a importar: ${products.length}\n`);

    for (const product of products) {
      const id = parseInt(product.ID);
      
      console.log(`\n🔄 Actualizando: ${product.Nombre} (ID: ${id})`);

      // Actualizar información básica del producto
      await pool.query(`
        UPDATE products
        SET 
          sku = $1,
          name = $2,
          category = $3,
          reference_price = $4,
          active = $5,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
      `, [
        product.SKU,
        product.Nombre,
        product.Categoria || null,
        parseFloat(product.Precio),
        product.Activo === 'Si',
        id
      ]);

      console.log('   ✓ Información básica actualizada');

      // Procesar variantes (si hay colores y tallas)
      if (product.Colores && product.Tallas) {
        const colores = product.Colores.split(',').map(c => c.trim()).filter(c => c);
        const tallas = product.Tallas.split(',').map(t => t.trim()).filter(t => t);

        // Eliminar variantes existentes
        await pool.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
        console.log('   ✓ Variantes antiguas eliminadas');

        // Crear nuevas variantes
        let variantesCreadas = 0;
        for (const color of colores) {
          for (const talla of tallas) {
            const skuVariant = `${product.SKU}-${color.toUpperCase().substring(0, 3)}-${talla}`;
            
            await pool.query(`
              INSERT INTO product_variants (product_id, color, size, sku_variant, active)
              VALUES ($1, $2, $3, $4, true)
            `, [id, color, talla, skuVariant]);
            
            variantesCreadas++;
          }
        }
        console.log(`   ✓ ${variantesCreadas} variantes creadas`);
      }
    }

    console.log('\n✅ IMPORTACIÓN COMPLETADA EXITOSAMENTE\n');

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importProductsFromCSV();

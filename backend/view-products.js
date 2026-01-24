// =====================================================
// SCRIPT PARA VER PRODUCTOS Y EXPORTAR A CSV
// UNA LÍNEA POR PRODUCTO
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

async function exportProductsToCSV() {
  try {
    console.log('\n📦 EXPORTANDO PRODUCTOS A CSV...\n');
    
    // Obtener productos con variantes agrupadas
    const result = await pool.query(`
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.category,
        p.reference_price,
        p.active,
        STRING_AGG(DISTINCT pi.image_url, '; ' ORDER BY pi.image_url) as imagenes,
        STRING_AGG(DISTINCT pv.color, ', ' ORDER BY pv.color) as colores,
        STRING_AGG(DISTINCT pv.size, ', ' ORDER BY pv.size) as tallas,
        COUNT(DISTINCT pv.id) as total_variantes
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      GROUP BY p.id, p.sku, p.name, p.category, p.reference_price, p.active
      ORDER BY p.id
    `);

    // Crear CSV con BOM para UTF-8 (para que Excel lo lea correctamente)
    let csv = '\uFEFF'; // BOM
    csv += 'ID,SKU,Nombre,Categoria,Precio,Activo,Colores,Tallas,Total Variantes,Imagenes\n';
    
    for (const row of result.rows) {
      csv += `${row.id},`;
      csv += `"${row.sku}",`;
      csv += `"${row.name}",`;
      csv += `"${row.category || ''}",`;
      csv += `${row.reference_price},`;
      csv += `${row.active ? 'Si' : 'No'},`;
      csv += `"${row.colores || ''}",`;
      csv += `"${row.tallas || ''}",`;
      csv += `${row.total_variantes || 0},`;
      csv += `"${row.imagenes || ''}"\n`;
    }

    // Guardar archivo
    const outputPath = path.join(__dirname, 'productos_export.csv');
    fs.writeFileSync(outputPath, csv, 'utf8');

    console.log('✅ CSV creado exitosamente!\n');
    console.log(`📄 Ubicacion: ${outputPath}\n`);
    console.log('📊 RESUMEN:\n');
    
    // Mostrar resumen en consola
    console.log('='.repeat(150));
    console.log(
      'ID'.padEnd(5) + 
      'SKU'.padEnd(15) + 
      'Nombre'.padEnd(35) + 
      'Categoria'.padEnd(20) + 
      'Precio'.padEnd(12) + 
      'Variantes'.padEnd(10) + 
      'Colores'
    );
    console.log('='.repeat(150));
    
    for (const row of result.rows) {
      console.log(
        String(row.id).padEnd(5) +
        row.sku.padEnd(15) +
        row.name.substring(0, 32).padEnd(35) +
        (row.category || '').padEnd(20) +
        `₡${row.reference_price}`.padEnd(12) +
        String(row.total_variantes || 0).padEnd(10) +
        (row.colores || 'Sin variantes')
      );
    }
    console.log('='.repeat(150));
    console.log(`\nTotal productos: ${result.rows.length}\n`);

    await pool.end();

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

exportProductsToCSV();

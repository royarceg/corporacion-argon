const pool = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Ejecutando migración: variant_images...');
    
    // Leer el archivo SQL (está en la carpeta padre, no en backend)
    const sqlPath = path.join(__dirname, '..', 'database', 'add-variant-images.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    // Ejecutar el script
    await client.query(sql);
    
    console.log('✅ Migración completada exitosamente');
    console.log('📊 Tabla variant_images creada');
    console.log('📦 Datos migrados desde product_images');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

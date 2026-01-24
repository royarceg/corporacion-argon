const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configuración de la base de datos (usando variables de entorno)
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'argom_catalog',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando migración de videos con variantes...');
    
    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, '../database/add-variant-videos.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    // Ejecutar la migración
    await client.query(sql);
    
    console.log('✅ Migración completada exitosamente');
    console.log('📊 Tabla variant_videos creada');
    console.log('📦 Videos existentes migrados con color NULL');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('🎉 Proceso completado');
    process.exit(0);
  })
  .catch((err) => {
    console.error('💥 Error fatal:', err);
    process.exit(1);
  });

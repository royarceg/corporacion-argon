// =====================================================
// MIGRACIÓN: Agregar soporte para múltiples imágenes y videos
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

async function migrate() {
  console.log('🚀 Iniciando migración de multimedia...\n');

  try {
    // 1. Crear tabla de imágenes de productos
    console.log('📷 Creando tabla product_images...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_images (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        image_url TEXT NOT NULL,
        public_id TEXT,
        is_primary BOOLEAN DEFAULT false,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla product_images creada\n');

    // 2. Crear tabla de videos de productos
    console.log('🎥 Creando tabla product_videos...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_videos (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        video_url TEXT NOT NULL,
        public_id TEXT,
        thumbnail_url TEXT,
        duration INTEGER,
        display_order INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla product_videos creada\n');

    // 3. Crear índices para mejorar rendimiento
    console.log('🔍 Creando índices...');
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_product_images_product_id 
      ON product_images(product_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_product_videos_product_id 
      ON product_videos(product_id)
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_product_images_primary 
      ON product_images(product_id, is_primary)
    `);
    console.log('✅ Índices creados\n');

    // 4. Verificar estructura
    console.log('📋 Verificando tablas creadas:');
    const imageCount = await pool.query('SELECT COUNT(*) FROM product_images');
    const videoCount = await pool.query('SELECT COUNT(*) FROM product_videos');
    
    console.log(`  - product_images: ${imageCount.rows[0].count} registros`);
    console.log(`  - product_videos: ${videoCount.rows[0].count} registros\n`);

    console.log('✅ ¡Migración completada exitosamente!\n');
    console.log('📝 Ahora puedes:');
    console.log('  1. Reiniciar el backend: npm start');
    console.log('  2. Crear o editar productos');
    console.log('  3. Subir imágenes y videos\n');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

migrate();

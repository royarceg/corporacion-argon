const { Pool } = require('pg');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Configurar Cloudinary directamente
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const IMAGES_PATH = '/Users/gustavocerdascampos/Downloads/Proyectos/Proyectos en Proceso/Corporacion_ARGOM/00. Multimedia/Imagenes-K9';

// Productos a actualizar
const productos = [
  { id: 7, sku: 'ZAP-01', color: 'Beige' },
  { id: 8, sku: 'ZAP-02', color: 'Negro' }
];

async function uploadImageToCloudinary(imagePath, productCode) {
  try {
    console.log(`   📤 Subiendo imagen: ${productCode}...`);
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'productos',
      public_id: productCode,
      resource_type: 'image'
    });
    console.log(`   ✅ Imagen subida: ${result.secure_url}`);
    return result.secure_url;
  } catch (error) {
    console.error(`   ❌ Error subiendo imagen ${productCode}:`, error.message);
    return null;
  }
}

async function updateProductImages() {
  console.log('🖼️  SUBIENDO IMÁGENES PARA ZAP-01 Y ZAP-02\n');
  console.log(`☁️  Cloudinary configurado: ${process.env.CLOUDINARY_CLOUD_NAME || 'NO CONFIGURADO'}\n`);

  try {
    for (const producto of productos) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 Procesando: ${producto.sku} (ID: ${producto.id})`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // Buscar imagen
      let imageUrl = null;
      const possibleExtensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
      
      for (const ext of possibleExtensions) {
        const imagePath = path.join(IMAGES_PATH, `${producto.sku}${ext}`);
        if (fs.existsSync(imagePath)) {
          console.log(`   📁 Imagen encontrada: ${imagePath}`);
          imageUrl = await uploadImageToCloudinary(imagePath, producto.sku);
          break;
        }
      }

      if (!imageUrl) {
        console.log(`   ⚠️  No se encontró imagen para ${producto.sku}`);
        continue;
      }

      // Actualizar base de datos
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Insertar en product_images
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT DO NOTHING`,
          [producto.id, imageUrl, true, 0]
        );

        // Insertar en variant_images
        await client.query(
          `INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT DO NOTHING`,
          [producto.id, imageUrl, producto.color, true, 0]
        );

        await client.query('COMMIT');
        console.log(`   ✅ Imagen guardada en la base de datos`);
        console.log(`   🎉 ${producto.sku} actualizado exitosamente`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`   ❌ Error actualizando BD para ${producto.sku}:`, error.message);
      } finally {
        client.release();
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ ACTUALIZACIÓN COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await pool.end();
  }
}

updateProductImages();

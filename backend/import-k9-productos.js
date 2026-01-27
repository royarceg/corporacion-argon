const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { cloudinary } = require('./src/config/cloudinary');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const CLIENT_ID = 4; // K-9 Internacional S.A.
const IMAGES_PATH = '/Users/gustavocerdascampos/Downloads/Proyectos/Proyectos en Proceso/Corporacion_ARGOM/00. Multimedia/Imagenes-K9';
const EXCEL_PATH = '/Users/gustavocerdascampos/Downloads/Proyectos/Proyectos en Proceso/Corporacion_ARGOM/00. Multimedia/Imagenes-K9/Productos Catalogo Inventario.xlsx';

// Función para subir imagen a Cloudinary
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

// Función para extraer tallas de las observaciones
function extractSizes(observaciones) {
  if (!observaciones) return [];
  
  const sizes = [];
  const regex = /TALLA (\d+)/g;
  let match;
  
  while ((match = regex.exec(observaciones)) !== null) {
    sizes.push(match[1]);
  }
  
  // Eliminar duplicados y ordenar
  return [...new Set(sizes)].sort((a, b) => parseInt(a) - parseInt(b));
}

async function importProducts() {
  console.log('🚀 IMPORTANDO PRODUCTOS ZAP-01 Y ZAP-02 PARA K-9 INTERNACIONAL\n');

  try {
    // 1. Leer Excel
    console.log('📖 Leyendo archivo Excel...');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(EXCEL_PATH);
    const worksheet = workbook.worksheets[0];
    
    const products = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header
      
      const code = row.getCell(1).value;
      const description = row.getCell(2).value;
      const observations = row.getCell(3).value;
      const unit = row.getCell(4).value;
      
      // Solo ZAP-01 y ZAP-02
      if (code === 'ZAP-01' || code === 'ZAP-02') {
        products.push({
          code,
          description,
          observations,
          unit
        });
      }
    });
    
    console.log(`✅ ${products.length} productos encontrados (ZAP-01, ZAP-02)\n`);

    // 2. Procesar cada producto
    for (const product of products) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📦 Procesando: ${product.code}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

      // 3. Buscar imagen en la carpeta
      let imageUrl = null;
      const possibleExtensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];
      
      for (const ext of possibleExtensions) {
        const imagePath = path.join(IMAGES_PATH, `${product.code}${ext}`);
        if (fs.existsSync(imagePath)) {
          imageUrl = await uploadImageToCloudinary(imagePath, product.code);
          break;
        }
      }

      if (!imageUrl) {
        console.log(`   ⚠️  No se encontró imagen para ${product.code}`);
      }

      // 4. Extraer información del producto
      const sizes = extractSizes(product.observations);
      console.log(`   📏 Tallas encontradas: ${sizes.join(', ')}`);

      // Determinar color del nombre
      let color = 'N/A';
      if (product.description.toUpperCase().includes('BEIGE')) {
        color = 'Beige';
      } else if (product.description.toUpperCase().includes('NEGRA') || product.description.toUpperCase().includes('NEGRO')) {
        color = 'Negro';
      }

      // 5. Crear producto en la base de datos
      const client = await pool.connect();
      
      try {
        await client.query('BEGIN');

        // Insertar producto
        const productResult = await client.query(
          `INSERT INTO products (sku, name, description, category, reference_price, active)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id`,
          [
            product.code,
            product.description,
            product.description,
            'Zapatos',
            0, // Sin precio de referencia
            true
          ]
        );

        const productId = productResult.rows[0].id;
        console.log(`   ✅ Producto creado (ID: ${productId})`);

        // Insertar imagen principal si existe
        if (imageUrl) {
          await client.query(
            `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
             VALUES ($1, $2, $3, $4)`,
            [productId, imageUrl, true, 0]
          );

          await client.query(
            `INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
             VALUES ($1, $2, $3, $4, $5)`,
            [productId, imageUrl, color, true, 0]
          );

          console.log(`   ✅ Imagen guardada como portada`);
        }

        // Crear variantes de tallas
        for (const size of sizes) {
          const skuVariant = `${product.code}-${size}`;
          
          await client.query(
            `INSERT INTO product_variants (product_id, color, size, sku_variant, active)
             VALUES ($1, $2, $3, $4, $5)`,
            [productId, color, size, skuVariant, true]
          );
        }
        console.log(`   ✅ ${sizes.length} variantes creadas`);

        // Asignar producto al cliente K-9 Internacional
        await client.query(
          `INSERT INTO client_products (client_id, product_id, active)
           VALUES ($1, $2, $3)`,
          [CLIENT_ID, productId, true]
        );
        console.log(`   ✅ Producto asignado a K-9 Internacional`);

        await client.query('COMMIT');
        console.log(`   🎉 ${product.code} importado exitosamente`);

      } catch (error) {
        await client.query('ROLLBACK');
        console.error(`   ❌ Error procesando ${product.code}:`, error.message);
      } finally {
        client.release();
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ IMPORTACIÓN COMPLETADA');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await pool.end();
  }
}

importProducts();

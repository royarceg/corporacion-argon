// =====================================================
// IMPORTACIÓN MASIVA DE TODOS LOS PRODUCTOS K-9
// Sube imágenes a Cloudinary y crea productos en BD
// Solo usa carpeta AI
// =====================================================

// IMPORTANTE: Cargar variables de entorno PRIMERO
require('dotenv').config();

const { Pool } = require('pg');
const { cloudinary } = require('./src/config/cloudinary');
const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const CLIENT_ID = 4; // K-9 Internacional S.A.
const IMAGES_PATH = '/Users/gustavocerdascampos/Downloads/Proyectos/Proyectos en Proceso/Corporacion_ARGOM/00. Multimedia/Imagenes-K9/AI';
const EXCEL_PATH = '/Users/gustavocerdascampos/Downloads/Proyectos/Proyectos en Proceso/Corporacion_ARGOM/00. Multimedia/Imagenes-K9/Originales/Productos Catalogo Inventario.xlsx';

// =====================================================
// FUNCIÓN PARA DETECTAR CATEGORÍA AUTOMÁTICAMENTE
// =====================================================
function detectCategory(descripcion, codigo) {
  const desc = descripcion.toUpperCase();
  const cod = codigo.toUpperCase();

  // Zapatos y Calzado
  if (desc.includes('BOTIN') || desc.includes('BOTA') || cod.startsWith('ZAP-')) {
    return 'Zapatos';
  }

  // Loncheras
  if (desc.includes('LONCHERA') || cod.startsWith('LON-')) {
    return 'Loncheras';
  }

  // Accesorios personales
  if (desc.includes('NECES') || cod.startsWith('NEC-')) {
    return 'Neceser';
  }

  // Mochilas
  if (desc.includes('BULTO') || desc.includes('MOCHILA') || cod.startsWith('BUL-')) {
    return 'Mochilas';
  }

  // Botellas y vasos
  if (desc.includes('BOTELL') || desc.includes('TERMO') || cod.startsWith('BOT-')) {
    return 'Botellas';
  }
  if (desc.includes('VASO') || cod.startsWith('VAS-')) {
    return 'Vasos';
  }
  if (desc.includes('TAZA') || cod.startsWith('TAZ-')) {
    return 'Tazas';
  }

  // Gorras y sombreros
  if (desc.includes('GORRA') || cod.startsWith('GOR-')) {
    return 'Gorras';
  }

  // Paraguas
  if (desc.includes('PARAGUA') || cod.startsWith('PAN-')) {
    return 'Paraguas';
  }

  // Llaveros y Focos
  if (desc.includes('FOCO') || cod.startsWith('FOC-')) {
    return 'Focos';
  }

  // Ropa y textil
  if (desc.includes('JACKET') || desc.includes('CHALECO') || desc.includes('CAMISA') ||
    cod.startsWith('JAC-') || cod.startsWith('CHA-') || cod.startsWith('CAM-')) {
    return 'Ropa';
  }

  // Delantales y guantes
  if (desc.includes('DELANTAL') || cod.startsWith('AIS-') || cod.startsWith('ABR-')) {
    return 'Protección';
  }
  if (desc.includes('GUANTE') || cod.startsWith('GUA-')) {
    return 'Guantes';
  }

  // Capas y ponchos
  if (desc.includes('CAPA') || desc.includes('PONCHO') || cod.startsWith('CAP-')) {
    return 'Capas';
  }

  // Cascos
  if (desc.includes('CASCO') || cod.startsWith('CAS-')) {
    return 'Cascos';
  }

  // Colchonetas
  if (desc.includes('COLCHONETA') || cod.startsWith('COL-')) {
    return 'Colchonetas';
  }

  // Bolsos y carteras
  if (desc.includes('BOLSO') || desc.includes('CARTERA') || cod.startsWith('COR-')) {
    return 'Bolsos';
  }

  // Cuadernos y libretas
  if (desc.includes('CUADERNO') || desc.includes('LIBRETA') || cod.startsWith('CUG-')) {
    return 'Cuadernos';
  }

  // Peluches y juguetes
  if (desc.includes('PELUCHE') || desc.includes('OSO') || cod.startsWith('PCH-')) {
    return 'Peluches';
  }

  // Parlantes
  if (desc.includes('PARLANTE') || cod.startsWith('PAR-')) {
    return 'Parlantes';
  }

  // Protector
  if (desc.includes('PROTECTOR') || cod.startsWith('PRO-')) {
    return 'Protectores';
  }

  // Fajas
  if (desc.includes('FAJA') || cod.startsWith('FAJ-')) {
    return 'Fajas';
  }

  // Faroles
  if (desc.includes('FAROL') || cod.startsWith('FAR-')) {
    return 'Faroles';
  }

  // Repuestos de moto
  if (desc.includes('CADENA') || desc.includes('BUJIA') || desc.includes('FILTRO') ||
    cod.startsWith('CAD-') || cod.startsWith('BUJ-') || cod.startsWith('FFT-') ||
    cod.startsWith('DFT-') || cod.startsWith('DFD-') || cod.startsWith('ESV-') ||
    cod.startsWith('CCC-')) {
    return 'Repuestos Moto';
  }

  // Kit de luces
  if (desc.includes('KIT') && desc.includes('LUZ')) {
    return 'Kit Luces Moto';
  }

  // Llantas
  if (desc.includes('LLANTA') || cod.startsWith('LLA-')) {
    return 'Llantas';
  }

  // Neumáticos
  if (desc.includes('NEUMATICO') || cod.startsWith('NEU-')) {
    return 'Neumáticos';
  }

  // Cajillas
  if (desc.includes('CAJILLA') || cod.startsWith('CAJ-')) {
    return 'Cajillas';
  }

  // CD de música
  if (desc.includes('CD') && desc.includes('MUSICA')) {
    return 'CD Música';
  }

  // Halógenos
  if (desc.includes('HALOGENO') || cod.startsWith('HAL-')) {
    return 'Halógenos';
  }

  // Pantallas LED
  if (desc.includes('LED') || desc.includes('CABINET') || desc.includes('INDOOR') || desc.includes('OUTDOOR')) {
    return 'Pantallas LED';
  }

  // Dominó
  if (desc.includes('DOMINO') || cod.startsWith('DOM-')) {
    return 'Juegos';
  }

  // Espejos
  if (desc.includes('ESPEJO') || cod.startsWith('ESR-')) {
    return 'Espejos';
  }

  // Visera
  if (desc.includes('VISERA') || cod.startsWith('VIS-')) {
    return 'Viseras';
  }

  // Puertas
  if (desc.includes('PUERTA') || cod.startsWith('PUE-')) {
    return 'Puertas';
  }

  // Sanitario
  if (desc.includes('SANITARIO') || cod.startsWith('SDF-')) {
    return 'Sanitarios';
  }

  // Pasamontañas
  if (desc.includes('PASAMONTA') || cod.startsWith('PAF-')) {
    return 'Pasamontañas';
  }

  // Punteras
  if (desc.includes('PUNTERA') || cod.startsWith('PUN-')) {
    return 'Punteras';
  }

  // Chamarra
  if (desc.includes('CHAMARRA') || cod.startsWith('CHT-')) {
    return 'Chamarras';
  }

  // Golosinas
  if (desc.includes('GOLOSINA') || desc.includes('CHOCOLATE') || cod.startsWith('GOC-')) {
    return 'Golosinas';
  }

  // Platos
  if (desc.includes('PLATO') || cod.startsWith('PLT-')) {
    return 'Platos';
  }

  // Tarjetas
  if (desc.includes('TARJETA') || cod.startsWith('TAR-')) {
    return 'Tarjetas';
  }

  // Categoría por defecto
  return 'General';
}

// =====================================================
// FUNCIÓN PARA DETECTAR COLOR DEL NOMBRE
// =====================================================
function detectColor(descripcion) {
  const desc = descripcion.toUpperCase();

  if (desc.includes('BEIGE')) return 'Beige';
  if (desc.includes('NEGR')) return 'Negro';
  if (desc.includes('BLANCO')) return 'Blanco';
  if (desc.includes('ROJO')) return 'Rojo';
  if (desc.includes('AZUL')) return 'Azul';
  if (desc.includes('VERDE')) return 'Verde';
  if (desc.includes('AMARILLO')) return 'Amarillo';
  if (desc.includes('GRIS')) return 'Gris';
  if (desc.includes('CAFE') || desc.includes('CAFÉ') || desc.includes('MARRON') || desc.includes('MARRÓN')) return 'Café';
  if (desc.includes('NARANJA')) return 'Naranja';
  if (desc.includes('ROSA')) return 'Rosa';
  if (desc.includes('MORADO')) return 'Morado';

  return null; // Sin color específico
}

// =====================================================
// FUNCIÓN PARA EXTRAER TALLAS DE OBSERVACIONES
// =====================================================
function extractSizes(observaciones) {
  if (!observaciones) return [];

  const sizes = [];
  const regex = /TALLA (\d+)/gi;
  let match;

  while ((match = regex.exec(observaciones)) !== null) {
    sizes.push(match[1]);
  }

  // Eliminar duplicados y ordenar
  return [...new Set(sizes)].sort((a, b) => parseInt(a) - parseInt(b));
}

// =====================================================
// FUNCIÓN PARA BUSCAR IMAGEN CON VARIACIONES
// Maneja variaciones: /, :, _, espacios
// =====================================================
function findImagePath(productCode, imageNumber = null) {
  const possibleExtensions = ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];

  // Generar variaciones del código
  const codeVariations = [
    productCode,
    productCode.trim() + ' ', // Con espacio al final
    productCode.replace(/\//g, ':'), // / → :
    productCode.replace(/\//g, '_'), // / → _
    productCode.trim(), // Sin espacios extras
  ];

  for (const codeVariation of codeVariations) {
    for (const ext of possibleExtensions) {
      let filename;

      if (imageNumber === null) {
        // Imagen principal
        filename = `${codeVariation}${ext}`;
      } else {
        // Imagen adicional (.2, .3, etc.)
        filename = `${codeVariation}.${imageNumber}${ext}`;
      }

      const imagePath = path.join(IMAGES_PATH, filename);

      if (fs.existsSync(imagePath)) {
        return imagePath;
      }
    }
  }

  return null;
}

// =====================================================
// FUNCIÓN PARA SUBIR IMAGEN A CLOUDINARY
// =====================================================
async function uploadImageToCloudinary(imagePath, productCode) {
  try {
    const result = await cloudinary.uploader.upload(imagePath, {
      folder: 'productos',
      public_id: productCode,
      resource_type: 'image'
    });
    return result.secure_url;
  } catch (error) {
    console.error(`   ❌ Error subiendo imagen ${productCode}:`, error.message);
    return null;
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL DE IMPORTACIÓN
// =====================================================
async function importAllProducts() {
  console.log('🚀 IMPORTACIÓN MASIVA DE PRODUCTOS K-9\n');
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME || 'NO CONFIGURADO'}`);
  console.log(`🗄️  Base de datos: ${process.env.DB_NAME || 'NO CONFIGURADO'}`);
  console.log(`📁 Carpeta de imágenes: ${IMAGES_PATH}\n`);

  let productosImportados = 0;
  let productosConErrores = 0;
  let productosSinImagen = 0;
  let productosOmitidosDuplicados = 0;

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

      if (code) {
        products.push({
          code: String(code).trim(),
          description: description ? String(description).trim() : '',
          observations: observations ? String(observations).trim() : '',
          unit: unit ? String(unit).trim() : ''
        });
      }
    });

    console.log(`✅ ${products.length} productos encontrados en el Excel\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 2. Procesar cada producto
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const progress = `[${i + 1}/${products.length}]`;

      console.log(`${progress} 📦 ${product.code} - ${product.description.substring(0, 40)}...`);

      try {
        // 3. Verificar si el producto ya existe (evitar duplicados)
        const checkExists = await pool.query(
          'SELECT id FROM products WHERE sku = $1',
          [product.code]
        );

        if (checkExists.rows.length > 0) {
          console.log(`       ⚠️  Producto ya existe (ID: ${checkExists.rows[0].id}) - OMITIENDO`);
          productosOmitidosDuplicados++;
          console.log('');
          continue;
        }

        // 4. Buscar TODAS las imágenes del producto (principal + .2, .3, etc.)
        const imageUrls = [];

        // Buscar imagen principal
        const mainImagePath = findImagePath(product.code);

        if (!mainImagePath) {
          console.log(`       ⚠️  Sin imagen principal - OMITIENDO producto`);
          productosSinImagen++;
          console.log('');
          continue;
        }

        console.log(`       📸 Subiendo imagen principal...`);
        const mainImageUrl = await uploadImageToCloudinary(mainImagePath, product.code);
        if (mainImageUrl) {
          imageUrls.push({ url: mainImageUrl, order: 0 });
        }

        // Buscar imágenes adicionales (.2, .3, .4, etc.)
        let imageNumber = 2;
        let keepSearching = true;

        while (keepSearching && imageNumber <= 10) {
          const additionalImagePath = findImagePath(product.code, imageNumber);

          if (additionalImagePath) {
            console.log(`       📸 Subiendo imagen ${imageNumber}...`);
            const imageUrl = await uploadImageToCloudinary(additionalImagePath, `${product.code}-${imageNumber}`);
            if (imageUrl) {
              imageUrls.push({ url: imageUrl, order: imageNumber - 1 });
            }
            imageNumber++;
          } else {
            keepSearching = false;
          }
        }

        console.log(`       ✅ ${imageUrls.length} imagen(es) subida(s)`);

        // 5. Detectar información del producto
        const category = detectCategory(product.description, product.code);
        const color = detectColor(product.description);
        const sizes = extractSizes(product.observations);

        console.log(`       🏷️  Categoría: ${category}`);
        if (color) console.log(`       🎨 Color: ${color}`);
        if (sizes.length > 0) console.log(`       📏 Tallas: ${sizes.join(', ')}`);

        // 6. Insertar en base de datos
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
              product.description.substring(0, 255),
              product.description,
              category,
              0, // Sin precio de referencia
              true
            ]
          );

          const productId = productResult.rows[0].id;

          // Insertar imágenes en variant_images y product_images
          for (let imgIndex = 0; imgIndex < imageUrls.length; imgIndex++) {
            const imgData = imageUrls[imgIndex];
            const isPrimary = imgIndex === 0;

            // Insertar en variant_images (con color si existe)
            await client.query(
              `INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
               VALUES ($1, $2, $3, $4, $5)`,
              [productId, imgData.url, color, isPrimary, imgData.order]
            );

            // Insertar en product_images para compatibilidad
            await client.query(
              `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
               VALUES ($1, $2, $3, $4)`,
              [productId, imgData.url, isPrimary, imgData.order]
            );
          }

          // Crear variantes de tallas si existen
          if (sizes.length > 0 && color) {
            for (const size of sizes) {
              const skuVariant = `${product.code}-${size}`;

              await client.query(
                `INSERT INTO product_variants (product_id, color, size, sku_variant, active)
                 VALUES ($1, $2, $3, $4, $5)`,
                [productId, color, size, skuVariant, true]
              );
            }
            console.log(`       ✅ ${sizes.length} variante(s) creada(s)`);
          } else if (color && sizes.length === 0) {
            // Crear al menos una variante con el color
            await client.query(
              `INSERT INTO product_variants (product_id, color, size, sku_variant, active)
               VALUES ($1, $2, $3, $4, $5)`,
              [productId, color, null, product.code, true]
            );
            console.log(`       ✅ 1 variante creada (solo color)`);
          }

          // Asignar producto al cliente K-9 Internacional
          await client.query(
            `INSERT INTO client_products (client_id, product_id, active)
             VALUES ($1, $2, $3)`,
            [CLIENT_ID, productId, true]
          );

          await client.query('COMMIT');
          console.log(`       🎉 PRODUCTO IMPORTADO (ID: ${productId})`);
          productosImportados++;

        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`       ❌ Error en BD: ${error.message}`);
          productosConErrores++;
        } finally {
          client.release();
        }

      } catch (error) {
        console.error(`       ❌ Error general: ${error.message}`);
        productosConErrores++;
      }

      console.log(''); // Línea en blanco entre productos
    }

    // 7. Resumen final
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN DE IMPORTACIÓN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Productos importados: ${productosImportados}`);
    console.log(`⏭️  Productos duplicados (omitidos): ${productosOmitidosDuplicados}`);
    console.log(`⚠️  Productos sin imágenes (omitidos): ${productosSinImagen}`);
    console.log(`❌ Productos con errores: ${productosConErrores}`);
    console.log(`📦 Total procesados: ${products.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    await pool.end();
  }
}

// Ejecutar importación
importAllProducts();

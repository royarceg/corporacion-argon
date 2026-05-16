// =====================================================
// CONTROLADOR DE PRODUCTOS V3
// Con soporte para múltiples imágenes, videos y variantes
// =====================================================

const pool = require('../config/database');
const { fuzzySearch } = require('../services/fuzzySearch');
const { 
  validateNumericId, 
  validateRequired,
  validateSku,
  validateLength,
  validateNonNegativeNumber,
  sanitizeString
} = require('../middleware/validators');

// =====================================================
// GET PRODUCTS - Obtener productos del cliente
// OPTIMIZADO: Usa 4 queries en lugar de N+1
// =====================================================
const getProducts = async (req, res) => {
  try {
    const { client_id } = req.user;

    // Admin sin client_id: devolver todos los productos activos para previsualización
    if (!client_id) {
      const adminProducts = await pool.query(
        `SELECT id, sku, name, description, category, reference_price as price
         FROM products WHERE active = true ORDER BY category, name`
      );
      if (adminProducts.rows.length === 0) return res.json({ success: true, products: [] });
      const adminIds = adminProducts.rows.map(p => p.id);
      const [adminImgs, adminColors, adminSizes] = await Promise.all([
        pool.query(`SELECT product_id, image_url FROM product_images WHERE product_id = ANY($1) ORDER BY product_id, is_primary DESC, display_order ASC`, [adminIds]),
        pool.query(`SELECT DISTINCT product_id, color FROM product_variants WHERE product_id = ANY($1) AND active = true AND color IS NOT NULL ORDER BY product_id, color`, [adminIds]),
        pool.query(`SELECT DISTINCT product_id, size FROM product_variants WHERE product_id = ANY($1) AND active = true AND size IS NOT NULL ORDER BY product_id, size`, [adminIds]),
      ]);
      const iMap = {}, cMap = {}, sMap = {};
      adminImgs.rows.forEach(r => { if (!iMap[r.product_id]) iMap[r.product_id] = []; iMap[r.product_id].push(r.image_url); });
      adminColors.rows.forEach(r => { if (!cMap[r.product_id]) cMap[r.product_id] = []; cMap[r.product_id].push(r.color); });
      adminSizes.rows.forEach(r => { if (!sMap[r.product_id]) sMap[r.product_id] = []; sMap[r.product_id].push(r.size); });
      return res.json({
        success: true,
        products: adminProducts.rows.map(p => ({ ...p, images: iMap[p.id] || [], colors: cMap[p.id] || [], sizes: sMap[p.id] || [] }))
      });
    }

    // Query 1: Obtener todos los productos del cliente
    const productsResult = await pool.query(
      `SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.category,
        COALESCE(cpp.price, p.reference_price) as price
      FROM products p
      INNER JOIN client_products cp ON p.id = cp.product_id
      LEFT JOIN client_product_prices cpp ON p.id = cpp.product_id AND cpp.client_id = $1
      WHERE cp.client_id = $1 
        AND cp.active = true 
        AND p.active = true
      ORDER BY p.category, p.name`,
      [client_id]
    );

    // Si no hay productos, retornar vacío
    if (productsResult.rows.length === 0) {
      return res.json({ success: true, products: [] });
    }

    // Extraer IDs de productos para las siguientes queries
    const productIds = productsResult.rows.map(p => p.id);

    // Query 2: Obtener TODAS las imágenes de todos los productos en una sola query
    const imagesResult = await pool.query(
      `SELECT product_id, image_url, is_primary 
       FROM product_images 
       WHERE product_id = ANY($1)
       ORDER BY product_id, is_primary DESC, display_order ASC`,
      [productIds]
    );

    // Query 3: Obtener TODOS los colores de todos los productos
    const colorsResult = await pool.query(
      `SELECT DISTINCT product_id, color 
       FROM product_variants 
       WHERE product_id = ANY($1) AND active = true AND color IS NOT NULL
       ORDER BY product_id, color`,
      [productIds]
    );

    // Query 4: Obtener TODAS las tallas de todos los productos
    const sizesResult = await pool.query(
      `SELECT DISTINCT product_id, size 
       FROM product_variants 
       WHERE product_id = ANY($1) AND active = true AND size IS NOT NULL
       ORDER BY product_id, size`,
      [productIds]
    );

    // Crear mapas para acceso rápido O(1)
    const imagesMap = {};
    imagesResult.rows.forEach(row => {
      if (!imagesMap[row.product_id]) {
        imagesMap[row.product_id] = [];
      }
      imagesMap[row.product_id].push(row.image_url);
    });

    const colorsMap = {};
    colorsResult.rows.forEach(row => {
      if (!colorsMap[row.product_id]) {
        colorsMap[row.product_id] = [];
      }
      colorsMap[row.product_id].push(row.color);
    });

    const sizesMap = {};
    sizesResult.rows.forEach(row => {
      if (!sizesMap[row.product_id]) {
        sizesMap[row.product_id] = [];
      }
      sizesMap[row.product_id].push(row.size);
    });

    // Combinar datos (sin queries adicionales)
    const products = productsResult.rows.map(product => {
      const images = imagesMap[product.id] || [];
      return {
        ...product,
        image_url: images[0] || null,
        images: images,
        colors: colorsMap[product.id] || [],
        sizes: sizesMap[product.id] || []
      };
    });

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error en getProducts:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
};

// =====================================================
// GET PRODUCT BY ID - Obtener detalle completo de un producto
// =====================================================
const getProductById = async (req, res) => {
  try {
    const { client_id } = req.user;
    const { id } = req.params;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden ver productos' 
      });
    }

    // Verificar que el producto esté asignado al cliente
    const accessCheck = await pool.query(
      `SELECT 1 FROM client_products 
       WHERE client_id = $1 AND product_id = $2 AND active = true`,
      [client_id, id]
    );

    if (accessCheck.rows.length === 0) {
      return res.status(403).json({ 
        error: 'No tienes acceso a este producto' 
      });
    }

    // Obtener información del producto
    const productResult = await pool.query(
      `SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.category,
        p.variant_group,
        COALESCE(cpp.price, p.reference_price) as price,
        p.reference_price
      FROM products p
      LEFT JOIN client_product_prices cpp ON p.id = cpp.product_id AND cpp.client_id = $1
      WHERE p.id = $2 AND p.active = true`,
      [client_id, id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    const product = productResult.rows[0];

    // Obtener imágenes por color desde variant_images
    const variantImagesResult = await pool.query(
      `SELECT image_url, color, is_primary, display_order
       FROM variant_images 
       WHERE product_id = $1
       ORDER BY color NULLS FIRST, is_primary DESC, display_order ASC`,
      [id]
    );

    // Agrupar imágenes por color
    const imagesByColor = {};
    const generalImages = []; // Imágenes sin color específico

    variantImagesResult.rows.forEach(row => {
      if (row.color === null) {
        generalImages.push(row.image_url);
      } else {
        if (!imagesByColor[row.color]) {
          imagesByColor[row.color] = [];
        }
        imagesByColor[row.color].push(row.image_url);
      }
    });

    // Fallback: si no hay imágenes generales, usar todas las de variant_images
    // y si tampoco, usar product_images
    let displayImages = generalImages;
    if (displayImages.length === 0) {
      displayImages = variantImagesResult.rows.map(r => r.image_url);
    }
    if (displayImages.length === 0) {
      const productImagesResult = await pool.query(
        `SELECT image_url FROM product_images
         WHERE product_id = $1
         ORDER BY is_primary DESC, display_order ASC`,
        [id]
      );
      displayImages = productImagesResult.rows.map(r => r.image_url);
    }

    // Obtener TODOS los videos del producto con sus colores desde variant_videos
    const variantVideosResult = await pool.query(
      `SELECT video_url, color, thumbnail_url
       FROM variant_videos 
       WHERE product_id = $1
       ORDER BY display_order ASC`,
      [id]
    );

    // Agrupar videos por color (similar a imágenes)
    const videosByColor = {};
    const generalVideos = []; // Videos sin color específico

    variantVideosResult.rows.forEach(row => {
      if (row.color === null) {
        generalVideos.push(row.video_url);
      } else {
        if (!videosByColor[row.color]) {
          videosByColor[row.color] = [];
        }
        videosByColor[row.color].push(row.video_url);
      }
    });

    // Fallback a product_videos si variant_videos está vacía
    let videosFallback = [];
    if (variantVideosResult.rows.length === 0) {
      const videosResult = await pool.query(
        `SELECT video_url, thumbnail_url
         FROM product_videos 
         WHERE product_id = $1
         ORDER BY display_order ASC`,
        [id]
      );
      videosFallback = videosResult.rows.map(r => r.video_url);
    }

    // Obtener todas las variantes con id, talla, color y sku_variant
    const variantsResult = await pool.query(
      `SELECT id, size, color, sku_variant
       FROM product_variants
       WHERE product_id = $1 AND active = true
       ORDER BY color NULLS LAST, size`,
      [id]
    );

    // NUEVO: Obtener variantes de color (productos relacionados)
    let colorVariants = [];
    if (product.variant_group) {
      const colorVariantsResult = await pool.query(
        `SELECT 
          p.id,
          p.sku,
          p.name,
          pv.color,
          pi.image_url
        FROM products p
        INNER JOIN client_products cp ON p.id = cp.product_id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = true
        WHERE p.variant_group = $1 
          AND p.id != $2
          AND cp.client_id = $3
          AND cp.active = true
          AND p.active = true
        GROUP BY p.id, p.sku, p.name, pv.color, pi.image_url
        ORDER BY p.sku`,
        [product.variant_group, id, client_id]
      );
      colorVariants = colorVariantsResult.rows;
    }

    res.json({
      success: true,
      product: {
        ...product,
        images: displayImages,
        imagesByColor: imagesByColor,
        image_url: displayImages[0] || null,
        videos: variantVideosResult.rows.length > 0 ? [...generalVideos, ...Object.values(videosByColor).flat()] : videosFallback, // Todos los videos
        videosByColor: videosByColor, // NUEVO: Videos agrupados por color
        variants: variantsResult.rows,
        colors: [...new Set(variantsResult.rows.map(r => r.color).filter(Boolean))],
        sizes: [...new Set(variantsResult.rows.map(r => r.size).filter(Boolean))],
        color_variants: colorVariants
      }
    });

  } catch (error) {
    console.error('Error en getProductById:', error);
    res.status(500).json({ 
      error: 'Error al obtener producto' 
    });
  }
};

// =====================================================
// GET ALL PRODUCTS (ADMIN) - Obtener todos los productos
// OPTIMIZADO: Usa 5 queries en lugar de N+1
// =====================================================
const getAllProducts = async (req, res) => {
  try {
    // Query 1: Obtener todos los productos
    const productsResult = await pool.query(
      `SELECT 
        id,
        sku,
        name,
        description,
        category,
        reference_price,
        active
      FROM products
      ORDER BY name`
    );

    // Si no hay productos, retornar vacío
    if (productsResult.rows.length === 0) {
      return res.json({ success: true, products: [] });
    }

    const productIds = productsResult.rows.map(p => p.id);

    // Query 2: Obtener imágenes principales de todos los productos
    const imagesResult = await pool.query(
      `SELECT DISTINCT ON (product_id) product_id, image_url 
       FROM product_images 
       WHERE product_id = ANY($1) AND is_primary = true`,
      [productIds]
    );

    // Query 3: Obtener colores de todos los productos
    const colorsResult = await pool.query(
      `SELECT DISTINCT product_id, color 
       FROM product_variants 
       WHERE product_id = ANY($1) AND color IS NOT NULL
       ORDER BY product_id, color`,
      [productIds]
    );

    // Query 4: Obtener tallas de todos los productos
    const sizesResult = await pool.query(
      `SELECT DISTINCT product_id, size 
       FROM product_variants 
       WHERE product_id = ANY($1) AND size IS NOT NULL
       ORDER BY product_id, size`,
      [productIds]
    );

    // Query 5: Obtener conteo de variantes por producto
    const variantsCountResult = await pool.query(
      `SELECT product_id, COUNT(*) as count 
       FROM product_variants 
       WHERE product_id = ANY($1)
       GROUP BY product_id`,
      [productIds]
    );

    // Crear mapas para acceso rápido O(1)
    const imagesMap = {};
    imagesResult.rows.forEach(row => {
      imagesMap[row.product_id] = row.image_url;
    });

    const colorsMap = {};
    colorsResult.rows.forEach(row => {
      if (!colorsMap[row.product_id]) {
        colorsMap[row.product_id] = [];
      }
      colorsMap[row.product_id].push(row.color);
    });

    const sizesMap = {};
    sizesResult.rows.forEach(row => {
      if (!sizesMap[row.product_id]) {
        sizesMap[row.product_id] = [];
      }
      sizesMap[row.product_id].push(row.size);
    });

    const variantsCountMap = {};
    variantsCountResult.rows.forEach(row => {
      variantsCountMap[row.product_id] = parseInt(row.count);
    });

    // Combinar datos (sin queries adicionales)
    const products = productsResult.rows.map(product => ({
      ...product,
      image_url: imagesMap[product.id] || null,
      colors: colorsMap[product.id] || [],
      sizes: sizesMap[product.id] || [],
      variants_count: variantsCountMap[product.id] || 0
    }));

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos' 
    });
  }
};

// =====================================================
// GET PRODUCTS BY CATEGORY - Filtrar por categoría
// OPTIMIZADO: Usa 4 queries en lugar de N+1
// =====================================================
const getProductsByCategory = async (req, res) => {
  try {
    const { client_id } = req.user;
    const { category } = req.params;

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden ver productos' 
      });
    }

    // Query 1: Obtener productos de la categoría
    const productsResult = await pool.query(
      `SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.category,
        COALESCE(cpp.price, p.reference_price) as price
      FROM products p
      INNER JOIN client_products cp ON p.id = cp.product_id
      LEFT JOIN client_product_prices cpp ON p.id = cpp.product_id AND cpp.client_id = $1
      WHERE cp.client_id = $1 
        AND cp.active = true 
        AND p.active = true
        AND p.category = $2
      ORDER BY p.name`,
      [client_id, category]
    );

    // Si no hay productos, retornar vacío
    if (productsResult.rows.length === 0) {
      return res.json({ success: true, products: [] });
    }

    const productIds = productsResult.rows.map(p => p.id);

    // Query 2: Obtener TODAS las imágenes
    const imagesResult = await pool.query(
      `SELECT product_id, image_url, is_primary 
       FROM product_images 
       WHERE product_id = ANY($1)
       ORDER BY product_id, is_primary DESC, display_order ASC`,
      [productIds]
    );

    // Query 3: Obtener colores
    const colorsResult = await pool.query(
      `SELECT DISTINCT product_id, color 
       FROM product_variants 
       WHERE product_id = ANY($1) AND active = true AND color IS NOT NULL
       ORDER BY product_id, color`,
      [productIds]
    );

    // Query 4: Obtener tallas
    const sizesResult = await pool.query(
      `SELECT DISTINCT product_id, size 
       FROM product_variants 
       WHERE product_id = ANY($1) AND active = true AND size IS NOT NULL
       ORDER BY product_id, size`,
      [productIds]
    );

    // Crear mapas para acceso rápido O(1)
    const imagesMap = {};
    imagesResult.rows.forEach(row => {
      if (!imagesMap[row.product_id]) {
        imagesMap[row.product_id] = [];
      }
      imagesMap[row.product_id].push(row.image_url);
    });

    const colorsMap = {};
    colorsResult.rows.forEach(row => {
      if (!colorsMap[row.product_id]) {
        colorsMap[row.product_id] = [];
      }
      colorsMap[row.product_id].push(row.color);
    });

    const sizesMap = {};
    sizesResult.rows.forEach(row => {
      if (!sizesMap[row.product_id]) {
        sizesMap[row.product_id] = [];
      }
      sizesMap[row.product_id].push(row.size);
    });

    // Combinar datos (sin queries adicionales)
    const products = productsResult.rows.map(product => {
      const images = imagesMap[product.id] || [];
      return {
        ...product,
        image_url: images[0] || null,
        images: images,
        colors: colorsMap[product.id] || [],
        sizes: sizesMap[product.id] || []
      };
    });

    res.json({
      success: true,
      products
    });

  } catch (error) {
    console.error('Error en getProductsByCategory:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos por categoría' 
    });
  }
};

// =====================================================
// GET PRODUCT BY ID (ADMIN) - Obtener detalle completo para admin
// =====================================================
const getProductByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    // Buscar producto
    const productResult = await pool.query(
      `SELECT 
        id,
        sku,
        name,
        description,
        category,
        reference_price,
        active,
        created_at,
        updated_at
      FROM products
      WHERE id = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    const product = productResult.rows[0];

    // Obtener TODAS las imágenes con sus colores asignados
    const variantImagesResult = await pool.query(
      `SELECT image_url, color, is_primary, display_order
       FROM variant_images 
       WHERE product_id = $1
       ORDER BY display_order ASC`,
      [id]
    );

    // Convertir a formato que espera el frontend
    const imagesWithColors = variantImagesResult.rows.map(row => ({
      url: row.image_url,
      color: row.color,
      is_primary: row.is_primary,
      display_order: row.display_order
    }));

    // Obtener TODOS los videos con sus colores asignados desde variant_videos
    const variantVideosResult = await pool.query(
      `SELECT video_url, color, thumbnail_url, display_order
       FROM variant_videos 
       WHERE product_id = $1
       ORDER BY display_order ASC`,
      [id]
    );

    // Convertir a formato que espera el frontend
    const videosWithColors = variantVideosResult.rows.map(row => ({
      url: row.video_url,
      color: row.color,
      thumbnail_url: row.thumbnail_url,
      display_order: row.display_order
    }));

    // También obtener videos desde product_videos para compatibilidad (si variant_videos está vacía)
    let videosFallback = [];
    if (variantVideosResult.rows.length === 0) {
      const videosResult = await pool.query(
        `SELECT video_url, thumbnail_url, display_order
         FROM product_videos 
         WHERE product_id = $1
         ORDER BY display_order ASC`,
        [id]
      );
      videosFallback = videosResult.rows.map(r => r.video_url);
    }

    // Obtener TODAS las variantes
    const variantsResult = await pool.query(
      `SELECT 
        id,
        color,
        size,
        sku_variant,
        active
       FROM product_variants 
       WHERE product_id = $1
       ORDER BY color, size`,
      [id]
    );

    // Obtener colores únicos
    const colorsResult = await pool.query(
      `SELECT DISTINCT color 
       FROM product_variants 
       WHERE product_id = $1 AND color IS NOT NULL
       ORDER BY color`,
      [id]
    );

    // Obtener tallas únicas
    const sizesResult = await pool.query(
      `SELECT DISTINCT size 
       FROM product_variants 
       WHERE product_id = $1 AND size IS NOT NULL
       ORDER BY size`,
      [id]
    );

    res.json({
      success: true,
      product: {
        ...product,
        imagesWithColors: imagesWithColors, // Imágenes con información de color
        images: imagesWithColors.map(img => img.url), // Solo URLs para compatibilidad
        videosWithColors: videosWithColors, // NUEVO: Videos con información de color
        videos: videosWithColors.length > 0 ? videosWithColors.map(vid => vid.url) : videosFallback, // URLs para compatibilidad
        variants: variantsResult.rows,
        available_colors: colorsResult.rows.map(r => r.color),
        available_sizes: sizesResult.rows.map(r => r.size)
      }
    });

  } catch (error) {
    console.error('Error en getProductByIdAdmin:', error);
    res.status(500).json({ 
      error: 'Error al obtener producto' 
    });
  }
};

// =====================================================
// UPDATE PRODUCT (ADMIN) - Actualizar producto con imágenes y videos
// =====================================================
const updateProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { sku, name, description, category, reference_price, active, colors, sizes, images, videos, imagesWithColors, videosWithColors } = req.body;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    // Validaciones
    const errors = [];
    
    if (!validateRequired(sku)) {
      errors.push('SKU es requerido');
    } else if (!validateSku(sku)) {
      errors.push('SKU debe ser alfanumérico con guiones (2-50 caracteres)');
    }
    
    if (!validateRequired(name)) {
      errors.push('Nombre es requerido');
    } else if (!validateLength(name, 1, 255)) {
      errors.push('Nombre debe tener entre 1 y 255 caracteres');
    }
    
    if (reference_price !== undefined && !validateNonNegativeNumber(reference_price)) {
      errors.push('Precio de referencia debe ser un número válido');
    }
    
    if (errors.length > 0) {
      client.release();
      return res.status(400).json({ errors });
    }

    console.log('=== ACTUALIZANDO PRODUCTO ===');
    console.log('ID:', id);
    console.log('Imágenes recibidas:', images?.length || 0);
    console.log('Imágenes con colores:', imagesWithColors?.length || 0);
    console.log('Videos recibidos:', videos?.length || 0);
    console.log('Videos con colores:', videosWithColors?.length || 0);

    await client.query('BEGIN');

    // 1. Actualizar información básica del producto
    await client.query(
      `UPDATE products
       SET sku = $1, name = $2, description = $3, category = $4, reference_price = $5, active = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7`,
      [sku, name, description, category, reference_price, active, id]
    );

    // 2. Eliminar imágenes existentes de AMBAS tablas
    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await client.query('DELETE FROM variant_images WHERE product_id = $1', [id]);

    // 3. Insertar NUEVAS imágenes en variant_images (con colores asignados)
    if (imagesWithColors && imagesWithColors.length > 0) {
      const primaryIndex = req.body.primaryImageIndex !== undefined ? req.body.primaryImageIndex : 0;
      
      for (let i = 0; i < imagesWithColors.length; i++) {
        const imgData = imagesWithColors[i];
        await client.query(
          `INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, imgData.url, imgData.color || null, i === primaryIndex, i]
        );
        
        // También insertar en product_images para compatibilidad
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4)`,
          [id, imgData.url, i === primaryIndex, i]
        );
      }
      console.log(`${imagesWithColors.length} imágenes guardadas con colores, portada: índice ${primaryIndex}`);
    } else if (images && images.length > 0) {
      // Fallback: si no vienen con colores, guardar sin color (NULL)
      const primaryIndex = req.body.primaryImageIndex !== undefined ? req.body.primaryImageIndex : 0;
      
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [id, images[i], null, i === primaryIndex, i]
        );
        
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4)`,
          [id, images[i], i === primaryIndex, i]
        );
      }
      console.log(`${images.length} imágenes guardadas sin color, portada: índice ${primaryIndex}`);
    }

    // 4. Eliminar videos existentes de AMBAS tablas
    await client.query('DELETE FROM product_videos WHERE product_id = $1', [id]);
    await client.query('DELETE FROM variant_videos WHERE product_id = $1', [id]);

    // 5. Insertar NUEVOS videos en variant_videos (con colores asignados)
    if (videosWithColors && videosWithColors.length > 0) {
      for (let i = 0; i < videosWithColors.length; i++) {
        const vidData = videosWithColors[i];
        await client.query(
          `INSERT INTO variant_videos (product_id, video_url, color, display_order)
           VALUES ($1, $2, $3, $4)`,
          [id, vidData.url, vidData.color || null, i]
        );
        
        // También insertar en product_videos para compatibilidad
        await client.query(
          `INSERT INTO product_videos (product_id, video_url, display_order)
           VALUES ($1, $2, $3)`,
          [id, vidData.url, i]
        );
      }
      console.log(`${videosWithColors.length} videos guardados con colores`);
    } else if (videos && videos.length > 0) {
      // Fallback: si no vienen con colores, guardar sin color (NULL)
      for (let i = 0; i < videos.length; i++) {
        await client.query(
          `INSERT INTO variant_videos (product_id, video_url, color, display_order)
           VALUES ($1, $2, $3, $4)`,
          [id, videos[i], null, i]
        );
        
        await client.query(
          `INSERT INTO product_videos (product_id, video_url, display_order)
           VALUES ($1, $2, $3)`,
          [id, videos[i], i]
        );
      }
      console.log(`${videos.length} videos guardados sin color`);
    }

    // 6. Eliminar variantes existentes
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);

    // 7. Crear nuevas variantes
    if (colors && colors.length > 0 && sizes && sizes.length > 0) {
      for (const color of colors) {
        for (const size of sizes) {
          const skuVariant = `${sku}-${color.toUpperCase().substring(0, 3)}-${size}`;
          await client.query(
            `INSERT INTO product_variants (product_id, color, size, sku_variant, active)
             VALUES ($1, $2, $3, $4, true)`,
            [id, color, size, skuVariant]
          );
        }
      }
      console.log(`${colors.length * sizes.length} variantes creadas`);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en updateProduct:', error);
    res.status(500).json({ 
      error: 'Error al actualizar producto' 
    });
  } finally {
    client.release();
  }
};

// =====================================================
// CREATE PRODUCT (ADMIN) - Crear nuevo producto con imágenes y videos
// =====================================================
const createProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { sku, name, description, category, reference_price, active, colors, sizes, images, videos, imagesWithColors, videosWithColors } = req.body;

    // Validaciones
    const errors = [];
    
    if (!validateRequired(sku)) {
      errors.push('SKU es requerido');
    } else if (!validateSku(sku)) {
      errors.push('SKU debe ser alfanumérico con guiones (2-50 caracteres)');
    }
    
    if (!validateRequired(name)) {
      errors.push('Nombre es requerido');
    } else if (!validateLength(name, 1, 255)) {
      errors.push('Nombre debe tener entre 1 y 255 caracteres');
    }
    
    if (reference_price !== undefined && !validateNonNegativeNumber(reference_price)) {
      errors.push('Precio de referencia debe ser un número válido');
    }
    
    if (errors.length > 0) {
      client.release();
      return res.status(400).json({ errors });
    }

    console.log('=== CREANDO PRODUCTO ===');
    console.log('Imágenes recibidas:', images?.length || 0);
    console.log('Imágenes con colores:', imagesWithColors?.length || 0);
    console.log('Videos recibidos:', videos?.length || 0);
    console.log('Videos con colores:', videosWithColors?.length || 0);

    await client.query('BEGIN');

    // 1. Crear producto
    const productResult = await client.query(
      `INSERT INTO products (sku, name, description, category, reference_price, active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [sku, name, description, category, reference_price, active]
    );

    const productId = productResult.rows[0].id;
    console.log('Producto creado con ID:', productId);

    // 2. Insertar imágenes en variant_images (con colores asignados)
    if (imagesWithColors && imagesWithColors.length > 0) {
      const primaryIndex = req.body.primaryImageIndex !== undefined ? req.body.primaryImageIndex : 0;
      
      for (let i = 0; i < imagesWithColors.length; i++) {
        const imgData = imagesWithColors[i];
        await client.query(
          `INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [productId, imgData.url, imgData.color || null, i === primaryIndex, i]
        );
        
        // También insertar en product_images para compatibilidad
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4)`,
          [productId, imgData.url, i === primaryIndex, i]
        );
      }
      console.log(`${imagesWithColors.length} imágenes guardadas con colores, portada: índice ${primaryIndex}`);
    } else if (images && images.length > 0) {
      // Fallback: si no vienen con colores, guardar sin color (NULL)
      const primaryIndex = req.body.primaryImageIndex !== undefined ? req.body.primaryImageIndex : 0;
      
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO variant_images (product_id, image_url, color, is_primary, display_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [productId, images[i], null, i === primaryIndex, i]
        );
        
        await client.query(
          `INSERT INTO product_images (product_id, image_url, is_primary, display_order)
           VALUES ($1, $2, $3, $4)`,
          [productId, images[i], i === primaryIndex, i]
        );
      }
      console.log(`${images.length} imágenes guardadas sin color, portada: índice ${primaryIndex}`);
    }

    // 3. Insertar videos en variant_videos (con colores asignados)
    if (videosWithColors && videosWithColors.length > 0) {
      for (let i = 0; i < videosWithColors.length; i++) {
        const vidData = videosWithColors[i];
        await client.query(
          `INSERT INTO variant_videos (product_id, video_url, color, display_order)
           VALUES ($1, $2, $3, $4)`,
          [productId, vidData.url, vidData.color || null, i]
        );
        
        // También insertar en product_videos para compatibilidad
        await client.query(
          `INSERT INTO product_videos (product_id, video_url, display_order)
           VALUES ($1, $2, $3)`,
          [productId, vidData.url, i]
        );
      }
      console.log(`${videosWithColors.length} videos guardados con colores`);
    } else if (videos && videos.length > 0) {
      // Fallback: si no vienen con colores
      for (let i = 0; i < videos.length; i++) {
        await client.query(
          `INSERT INTO variant_videos (product_id, video_url, color, display_order)
           VALUES ($1, $2, $3, $4)`,
          [productId, videos[i], null, i]
        );
        
        await client.query(
          `INSERT INTO product_videos (product_id, video_url, display_order)
           VALUES ($1, $2, $3)`,
          [productId, videos[i], i]
        );
      }
      console.log(`${videos.length} videos guardados sin color`);
    }

    // 4. Crear variantes
    if (colors && colors.length > 0 && sizes && sizes.length > 0) {
      for (const color of colors) {
        for (const size of sizes) {
          const skuVariant = `${sku}-${color.toUpperCase().substring(0, 3)}-${size}`;
          await client.query(
            `INSERT INTO product_variants (product_id, color, size, sku_variant, active)
             VALUES ($1, $2, $3, $4, true)`,
            [productId, color, size, skuVariant]
          );
        }
      }
      console.log(`${colors.length * sizes.length} variantes creadas`);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Producto creado exitosamente',
      product_id: productId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en createProduct:', error);
    res.status(500).json({ 
      error: 'Error al crear producto' 
    });
  } finally {
    client.release();
  }
};

// =====================================================
// SEARCH PRODUCTS - Búsqueda difusa de productos
// OPTIMIZADO: Usa 4 queries en lugar de N+1
// =====================================================
const searchProducts = async (req, res) => {
  try {
    const { client_id } = req.user;
    const { q, threshold = 60 } = req.query;

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden buscar productos' 
      });
    }

    // Query 1: Obtener TODOS los productos del cliente
    const productsResult = await pool.query(
      `SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.category,
        COALESCE(cpp.price, p.reference_price) as price
      FROM products p
      INNER JOIN client_products cp ON p.id = cp.product_id
      LEFT JOIN client_product_prices cpp ON p.id = cpp.product_id AND cpp.client_id = $1
      WHERE cp.client_id = $1 
        AND cp.active = true 
        AND p.active = true`,
      [client_id]
    );

    // Aplicar búsqueda difusa
    let products = productsResult.rows;
    
    if (q && q.trim() !== '') {
      products = fuzzySearch(products, q, parseInt(threshold));
    }

    // Si no hay productos después del filtro, retornar vacío
    if (products.length === 0) {
      return res.json({
        success: true,
        products: [],
        query: q,
        total_results: 0
      });
    }

    const productIds = products.map(p => p.id);

    // Query 2: Obtener TODAS las imágenes
    const imagesResult = await pool.query(
      `SELECT product_id, image_url, is_primary 
       FROM product_images 
       WHERE product_id = ANY($1)
       ORDER BY product_id, is_primary DESC, display_order ASC`,
      [productIds]
    );

    // Query 3: Obtener colores
    const colorsResult = await pool.query(
      `SELECT DISTINCT product_id, color 
       FROM product_variants 
       WHERE product_id = ANY($1) AND active = true AND color IS NOT NULL
       ORDER BY product_id, color`,
      [productIds]
    );

    // Query 4: Obtener tallas
    const sizesResult = await pool.query(
      `SELECT DISTINCT product_id, size 
       FROM product_variants 
       WHERE product_id = ANY($1) AND active = true AND size IS NOT NULL
       ORDER BY product_id, size`,
      [productIds]
    );

    // Crear mapas para acceso rápido O(1)
    const imagesMap = {};
    imagesResult.rows.forEach(row => {
      if (!imagesMap[row.product_id]) {
        imagesMap[row.product_id] = [];
      }
      imagesMap[row.product_id].push(row.image_url);
    });

    const colorsMap = {};
    colorsResult.rows.forEach(row => {
      if (!colorsMap[row.product_id]) {
        colorsMap[row.product_id] = [];
      }
      colorsMap[row.product_id].push(row.color);
    });

    const sizesMap = {};
    sizesResult.rows.forEach(row => {
      if (!sizesMap[row.product_id]) {
        sizesMap[row.product_id] = [];
      }
      sizesMap[row.product_id].push(row.size);
    });

    // Combinar datos (sin queries adicionales)
    const productsWithImages = products.map(product => {
      const images = imagesMap[product.id] || [];
      return {
        ...product,
        image_url: images[0] || null,
        images: images,
        colors: colorsMap[product.id] || [],
        sizes: sizesMap[product.id] || []
      };
    });

    res.json({
      success: true,
      products: productsWithImages,
      query: q,
      total_results: productsWithImages.length
    });

  } catch (error) {
    console.error('Error en searchProducts:', error);
    res.status(500).json({ 
      error: 'Error al buscar productos' 
    });
  }
};

// =====================================================
// DELETE PRODUCT (ADMIN) - Eliminar producto
// =====================================================
const deleteProduct = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;

    // Validar ID
    if (!validateNumericId(id)) {
      client.release();
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    console.log('=== ELIMINANDO PRODUCTO ===');
    console.log('ID:', id);

    await client.query('BEGIN');

    // 1. Verificar que el producto existe
    const productCheck = await client.query(
      'SELECT id FROM products WHERE id = $1',
      [id]
    );

    if (productCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Producto no encontrado' 
      });
    }

    // 2. Eliminar datos relacionados
    await client.query('DELETE FROM product_variants WHERE product_id = $1', [id]);
    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    await client.query('DELETE FROM variant_images WHERE product_id = $1', [id]);
    await client.query('DELETE FROM product_videos WHERE product_id = $1', [id]);
    await client.query('DELETE FROM variant_videos WHERE product_id = $1', [id]);
    await client.query('DELETE FROM client_products WHERE product_id = $1', [id]);
    await client.query('DELETE FROM client_product_prices WHERE product_id = $1', [id]);
    
    // 3. Eliminar el producto
    await client.query('DELETE FROM products WHERE id = $1', [id]);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Producto eliminado exitosamente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en deleteProduct:', error);
    res.status(500).json({ 
      error: 'Error al eliminar producto' 
    });
  } finally {
    client.release();
  }
};

module.exports = {
  getProducts,
  getProductById,
  getProductByIdAdmin,
  getAllProducts,
  getProductsByCategory,
  updateProduct,
  createProduct,
  searchProducts,
  deleteProduct
};

// =====================================================
// CONTROLADOR DE PRODUCTOS V3
// Con soporte para múltiples imágenes, videos y variantes
// =====================================================

const pool = require('../config/database');
const { fuzzySearch } = require('../services/fuzzySearch');

// =====================================================
// GET PRODUCTS - Obtener productos del cliente
// =====================================================
const getProducts = async (req, res) => {
  try {
    const { client_id } = req.user;

    // Verificar que sea un cliente (no admin)
    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden ver productos' 
      });
    }

    // Buscar productos asignados a este cliente
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
      ORDER BY p.name`,
      [client_id]
    );

    // Para cada producto, obtener sus imágenes
    const products = await Promise.all(
      productsResult.rows.map(async (product) => {
        // Obtener TODAS las imágenes ordenadas
        const imagesResult = await pool.query(
          `SELECT image_url, is_primary 
           FROM product_images 
           WHERE product_id = $1
           ORDER BY is_primary DESC, display_order ASC`,
          [product.id]
        );

        const images = imagesResult.rows.map(r => r.image_url);

        // Obtener colores disponibles (únicos)
        const colorsResult = await pool.query(
          `SELECT DISTINCT color 
           FROM product_variants 
           WHERE product_id = $1 AND active = true AND color IS NOT NULL
           ORDER BY color`,
          [product.id]
        );

        // Obtener tallas disponibles (únicas)
        const sizesResult = await pool.query(
          `SELECT DISTINCT size 
           FROM product_variants 
           WHERE product_id = $1 AND active = true AND size IS NOT NULL
           ORDER BY size`,
          [product.id]
        );

        return {
          ...product,
          image_url: images[0] || null,
          images: images, // NUEVO: Array con todas las imágenes
          colors: colorsResult.rows.map(r => r.color),
          sizes: sizesResult.rows.map(r => r.size)
        };
      })
    );

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

    // Obtener colores disponibles
    const colorsResult = await pool.query(
      `SELECT DISTINCT color 
       FROM product_variants 
       WHERE product_id = $1 AND active = true AND color IS NOT NULL
       ORDER BY color`,
      [id]
    );

    // Obtener tallas disponibles
    const sizesResult = await pool.query(
      `SELECT DISTINCT size 
       FROM product_variants 
       WHERE product_id = $1 AND active = true AND size IS NOT NULL
       ORDER BY size`,
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
        images: generalImages, // Imágenes generales (sin color)
        imagesByColor: imagesByColor, // Imágenes agrupadas por color
        image_url: generalImages[0] || variantImagesResult.rows[0]?.image_url || null,
        videos: variantVideosResult.rows.length > 0 ? [...generalVideos, ...Object.values(videosByColor).flat()] : videosFallback, // Todos los videos
        videosByColor: videosByColor, // NUEVO: Videos agrupados por color
        available_colors: colorsResult.rows.map(r => r.color),
        available_sizes: sizesResult.rows.map(r => r.size),
        color_variants: colorVariants // NUEVO: Variantes de color
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
// =====================================================
const getAllProducts = async (req, res) => {
  try {
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

    const products = await Promise.all(
      productsResult.rows.map(async (product) => {
        // Obtener imagen principal
        const imageResult = await pool.query(
          `SELECT image_url 
           FROM product_images 
           WHERE product_id = $1 AND is_primary = true
           LIMIT 1`,
          [product.id]
        );

        // Obtener colores
        const colorsResult = await pool.query(
          `SELECT DISTINCT color 
           FROM product_variants 
           WHERE product_id = $1 AND color IS NOT NULL
           ORDER BY color`,
          [product.id]
        );

        // Obtener tallas
        const sizesResult = await pool.query(
          `SELECT DISTINCT size 
           FROM product_variants 
           WHERE product_id = $1 AND size IS NOT NULL
           ORDER BY size`,
          [product.id]
        );

        // Obtener conteo de variantes
        const variantsCountResult = await pool.query(
          `SELECT COUNT(*) as count 
           FROM product_variants 
           WHERE product_id = $1`,
          [product.id]
        );

        return {
          ...product,
          image_url: imageResult.rows[0]?.image_url || null,
          colors: colorsResult.rows.map(r => r.color),
          sizes: sizesResult.rows.map(r => r.size),
          variants_count: parseInt(variantsCountResult.rows[0].count)
        };
      })
    );

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

    const products = await Promise.all(
      productsResult.rows.map(async (product) => {
        // Obtener TODAS las imágenes
        const imagesResult = await pool.query(
          `SELECT image_url, is_primary 
           FROM product_images 
           WHERE product_id = $1
           ORDER BY is_primary DESC, display_order ASC`,
          [product.id]
        );

        const images = imagesResult.rows.map(r => r.image_url);

        const colorsResult = await pool.query(
          `SELECT DISTINCT color 
           FROM product_variants 
           WHERE product_id = $1 AND active = true AND color IS NOT NULL
           ORDER BY color`,
          [product.id]
        );

        const sizesResult = await pool.query(
          `SELECT DISTINCT size 
           FROM product_variants 
           WHERE product_id = $1 AND active = true AND size IS NOT NULL
           ORDER BY size`,
          [product.id]
        );

        return {
          ...product,
          image_url: images[0] || null,
          images: images, // Array con todas las imágenes
          colors: colorsResult.rows.map(r => r.color),
          sizes: sizesResult.rows.map(r => r.size)
        };
      })
    );

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

    // Obtener TODOS los productos del cliente
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

    // Para cada producto, obtener imágenes
    const productsWithImages = await Promise.all(
      products.map(async (product) => {
        // Obtener TODAS las imágenes
        const imagesResult = await pool.query(
          `SELECT image_url, is_primary 
           FROM product_images 
           WHERE product_id = $1
           ORDER BY is_primary DESC, display_order ASC`,
          [product.id]
        );

        const images = imagesResult.rows.map(r => r.image_url);

        const colorsResult = await pool.query(
          `SELECT DISTINCT color 
           FROM product_variants 
           WHERE product_id = $1 AND active = true AND color IS NOT NULL
           ORDER BY color`,
          [product.id]
        );

        const sizesResult = await pool.query(
          `SELECT DISTINCT size 
           FROM product_variants 
           WHERE product_id = $1 AND active = true AND size IS NOT NULL
           ORDER BY size`,
          [product.id]
        );

        return {
          ...product,
          image_url: images[0] || null,
          images: images, // Array con todas las imágenes
          colors: colorsResult.rows.map(r => r.color),
          sizes: sizesResult.rows.map(r => r.size)
        };
      })
    );

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

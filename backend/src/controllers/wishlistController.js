// =====================================================
// CONTROLADOR DE WISHLIST (LISTA DE DESEOS)
// =====================================================

const pool = require('../config/database');
const { validateNumericId, validateRequired } = require('../middleware/validators');

// =====================================================
// GET WISHLIST - Obtener lista de deseos del usuario
// =====================================================
const getWishlist = async (req, res) => {
  try {
    const { id: user_id, client_id } = req.user;

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden tener lista de deseos' 
      });
    }

    // Obtener productos en la wishlist con sus detalles
    const wishlistResult = await pool.query(
      `SELECT 
        w.id as wishlist_id,
        w.added_at,
        p.id as product_id,
        p.sku,
        p.name,
        p.description,
        p.category,
        COALESCE(cpp.price, p.reference_price) as price
      FROM wishlist w
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN client_product_prices cpp ON p.id = cpp.product_id AND cpp.client_id = $1
      WHERE w.user_id = $2 AND p.active = true
      ORDER BY w.added_at DESC`,
      [client_id, user_id]
    );

    // Para cada producto, obtener su imagen principal
    const wishlistItems = await Promise.all(
      wishlistResult.rows.map(async (item) => {
        const imageResult = await pool.query(
          `SELECT image_url 
           FROM product_images 
           WHERE product_id = $1 AND is_primary = true
           LIMIT 1`,
          [item.product_id]
        );

        return {
          ...item,
          image_url: imageResult.rows[0]?.image_url || null
        };
      })
    );

    res.json({
      success: true,
      wishlist: wishlistItems
    });

  } catch (error) {
    console.error('Error en getWishlist:', error);
    res.status(500).json({ 
      error: 'Error al obtener lista de deseos' 
    });
  }
};

// =====================================================
// ADD TO WISHLIST - Agregar producto a la lista
// =====================================================
const addToWishlist = async (req, res) => {
  try {
    const { id: user_id, client_id } = req.user;
    const { product_id } = req.body;

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden agregar a lista de deseos' 
      });
    }

    // Validar product_id
    if (!validateNumericId(product_id)) {
      return res.status(400).json({ error: 'product_id es requerido y debe ser un número válido' });
    }

    // Verificar que el producto exista y el cliente tenga acceso
    const productCheck = await pool.query(
      `SELECT p.id 
       FROM products p
       INNER JOIN client_products cp ON p.id = cp.product_id
       WHERE p.id = $1 AND cp.client_id = $2 AND p.active = true AND cp.active = true`,
      [product_id, client_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado o no tienes acceso' 
      });
    }

    // Intentar agregar a wishlist (ignorar si ya existe por el UNIQUE constraint)
    const result = await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)
       ON CONFLICT (user_id, product_id) DO NOTHING
       RETURNING id`,
      [user_id, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({ 
        success: true,
        message: 'Producto ya estaba en la lista de deseos',
        already_exists: true
      });
    }

    res.status(201).json({
      success: true,
      message: 'Producto agregado a lista de deseos',
      wishlist_id: result.rows[0].id
    });

  } catch (error) {
    console.error('Error en addToWishlist:', error);
    res.status(500).json({ 
      error: 'Error al agregar a lista de deseos' 
    });
  }
};

// =====================================================
// REMOVE FROM WISHLIST - Eliminar producto de la lista
// =====================================================
const removeFromWishlist = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { product_id } = req.params;

    // Validar product_id
    if (!validateNumericId(product_id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    // Eliminar el producto de la wishlist
    const result = await pool.query(
      `DELETE FROM wishlist 
       WHERE user_id = $1 AND product_id = $2
       RETURNING id`,
      [user_id, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado en la lista de deseos' 
      });
    }

    res.json({
      success: true,
      message: 'Producto eliminado de la lista de deseos'
    });

  } catch (error) {
    console.error('Error en removeFromWishlist:', error);
    res.status(500).json({ 
      error: 'Error al eliminar de lista de deseos' 
    });
  }
};

// =====================================================
// CHECK IF IN WISHLIST - Verificar si producto está en wishlist
// =====================================================
const checkWishlist = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { product_id } = req.params;

    // Validar product_id
    if (!validateNumericId(product_id)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    const result = await pool.query(
      `SELECT id FROM wishlist 
       WHERE user_id = $1 AND product_id = $2`,
      [user_id, product_id]
    );

    res.json({
      success: true,
      in_wishlist: result.rows.length > 0
    });

  } catch (error) {
    console.error('Error en checkWishlist:', error);
    res.status(500).json({ 
      error: 'Error al verificar lista de deseos' 
    });
  }
};

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist
};

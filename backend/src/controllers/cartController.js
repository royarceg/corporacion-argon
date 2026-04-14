// =====================================================
// CONTROLADOR DE CARRITO DE COMPRAS
// =====================================================

const pool = require('../config/database');
const { 
  validateNumericId, 
  validatePositiveNumber,
  validateRequired 
} = require('../middleware/validators');

// =====================================================
// GET CART - Obtener carrito del usuario
// =====================================================
const getCart = async (req, res) => {
  try {
    const { id: user_id, client_id } = req.user;

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden tener carrito' 
      });
    }

    // Obtener items del carrito con detalles
    const cartResult = await pool.query(
      `SELECT 
        c.id as cart_item_id,
        c.quantity,
        c.unit_price,
        c.added_at,
        c.updated_at,
        p.id as product_id,
        p.sku,
        p.name,
        p.description,
        p.category,
        v.id as variant_id,
        v.color,
        v.size,
        v.sku_variant,
        v.stock_quantity
      FROM cart_items c
      INNER JOIN products p ON c.product_id = p.id
      LEFT JOIN product_variants v ON c.variant_id = v.id
      WHERE c.user_id = $1 AND p.active = true
      ORDER BY c.added_at DESC`,
      [user_id]
    );

    // Para cada item, obtener su imagen principal y calcular subtotal
    const cartItems = await Promise.all(
      cartResult.rows.map(async (item) => {
        const imageResult = await pool.query(
          `SELECT image_url 
           FROM product_images 
           WHERE product_id = $1 AND is_primary = true
           LIMIT 1`,
          [item.product_id]
        );

        const subtotal = parseFloat(item.unit_price) * item.quantity;

        return {
          ...item,
          image_url: imageResult.rows[0]?.image_url || null,
          subtotal: subtotal.toFixed(2)
        };
      })
    );

    // Calcular total del carrito
    const total = cartItems.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);

    res.json({
      success: true,
      cart: {
        items: cartItems,
        total_items: cartItems.length,
        total_quantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        total: total.toFixed(2)
      }
    });

  } catch (error) {
    console.error('Error en getCart:', error);
    res.status(500).json({ 
      error: 'Error al obtener carrito' 
    });
  }
};

// =====================================================
// ADD TO CART - Agregar producto al carrito
// =====================================================
const addToCart = async (req, res) => {
  try {
    const { id: user_id, client_id } = req.user;
    const { product_id, variant_id, quantity } = req.body;

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden agregar al carrito' 
      });
    }

    // Validaciones
    const errors = [];
    
    if (!validateNumericId(product_id)) {
      errors.push('product_id es requerido y debe ser un número válido');
    }
    
    if (!validatePositiveNumber(quantity)) {
      errors.push('quantity debe ser un número mayor a 0');
    }
    
    if (variant_id && !validateNumericId(variant_id)) {
      errors.push('variant_id debe ser un número válido');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Verificar que el producto exista y el cliente tenga acceso
    const productCheck = await pool.query(
      `SELECT p.id, COALESCE(cpp.price, p.reference_price) as price
       FROM products p
       INNER JOIN client_products cp ON p.id = cp.product_id
       LEFT JOIN client_product_prices cpp ON p.id = cpp.product_id AND cpp.client_id = $1
       WHERE p.id = $2 AND cp.client_id = $1 AND p.active = true AND cp.active = true`,
      [client_id, product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Producto no encontrado o no tienes acceso' 
      });
    }

    const unit_price = productCheck.rows[0].price;

    // Si se especificó una variante, verificar que exista y tenga stock
    if (variant_id) {
      const variantCheck = await pool.query(
        `SELECT stock_quantity 
         FROM product_variants 
         WHERE id = $1 AND product_id = $2 AND active = true`,
        [variant_id, product_id]
      );

      if (variantCheck.rows.length === 0) {
        return res.status(404).json({ 
          error: 'Variante no encontrada' 
        });
      }

      // Stock check omitido: plataforma B2B — ARGON confirma disponibilidad antes de procesar
    }

    // Verificar si ya existe este producto/variante en el carrito
    const existingItem = await pool.query(
      `SELECT id, quantity FROM cart_items 
       WHERE user_id = $1 AND product_id = $2 AND ($3::integer IS NULL OR variant_id = $3)`,
      [user_id, product_id, variant_id || null]
    );

    let result;

    if (existingItem.rows.length > 0) {
      // Actualizar cantidad si ya existe
      const newQuantity = existingItem.rows[0].quantity + quantity;
      
      result = await pool.query(
        `UPDATE cart_items 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2
         RETURNING id`,
        [newQuantity, existingItem.rows[0].id]
      );

      return res.json({
        success: true,
        message: 'Cantidad actualizada en el carrito',
        cart_item_id: result.rows[0].id,
        new_quantity: newQuantity
      });
    } else {
      // Agregar nuevo item
      result = await pool.query(
        `INSERT INTO cart_items (user_id, product_id, variant_id, quantity, unit_price)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [user_id, product_id, variant_id || null, quantity, unit_price]
      );

      return res.status(201).json({
        success: true,
        message: 'Producto agregado al carrito',
        cart_item_id: result.rows[0].id
      });
    }

  } catch (error) {
    console.error('Error en addToCart:', error);
    res.status(500).json({ 
      error: 'Error al agregar al carrito' 
    });
  }
};

// =====================================================
// UPDATE CART ITEM - Actualizar cantidad de un item
// =====================================================
const updateCartItem = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { cart_item_id } = req.params;
    const { quantity } = req.body;

    // Validar ID del item
    if (!validateNumericId(cart_item_id)) {
      return res.status(400).json({ error: 'ID de item inválido' });
    }

    // Validar cantidad
    if (!validatePositiveNumber(quantity)) {
      return res.status(400).json({ error: 'quantity debe ser un número mayor a 0' });
    }

    // Verificar que el item pertenezca al usuario y obtener variante
    const itemCheck = await pool.query(
      `SELECT variant_id FROM cart_items 
       WHERE id = $1 AND user_id = $2`,
      [cart_item_id, user_id]
    );

    if (itemCheck.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Item no encontrado en tu carrito' 
      });
    }

    // Stock check omitido: plataforma B2B — ARGON confirma disponibilidad antes de procesar

    // Actualizar cantidad
    const result = await pool.query(
      `UPDATE cart_items 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, quantity`,
      [quantity, cart_item_id]
    );

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      cart_item_id: result.rows[0].id,
      new_quantity: result.rows[0].quantity
    });

  } catch (error) {
    console.error('Error en updateCartItem:', error);
    res.status(500).json({ 
      error: 'Error al actualizar item del carrito' 
    });
  }
};

// =====================================================
// REMOVE FROM CART - Eliminar item del carrito
// =====================================================
const removeFromCart = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const { cart_item_id } = req.params;

    // Validar ID del item
    if (!validateNumericId(cart_item_id)) {
      return res.status(400).json({ error: 'ID de item inválido' });
    }

    const result = await pool.query(
      `DELETE FROM cart_items 
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [cart_item_id, user_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Item no encontrado en tu carrito' 
      });
    }

    res.json({
      success: true,
      message: 'Item eliminado del carrito'
    });

  } catch (error) {
    console.error('Error en removeFromCart:', error);
    res.status(500).json({ 
      error: 'Error al eliminar item del carrito' 
    });
  }
};

// =====================================================
// CLEAR CART - Vaciar todo el carrito
// =====================================================
const clearCart = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    await pool.query(
      `DELETE FROM cart_items WHERE user_id = $1`,
      [user_id]
    );

    res.json({
      success: true,
      message: 'Carrito vaciado'
    });

  } catch (error) {
    console.error('Error en clearCart:', error);
    res.status(500).json({ 
      error: 'Error al vaciar carrito' 
    });
  }
};

// =====================================================
// GET CART COUNT - Obtener cantidad de items en carrito
// =====================================================
const getCartCount = async (req, res) => {
  try {
    const { id: user_id } = req.user;

    const result = await pool.query(
      `SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_quantity
       FROM cart_items 
       WHERE user_id = $1`,
      [user_id]
    );

    res.json({
      success: true,
      items_count: parseInt(result.rows[0].count),
      total_quantity: parseInt(result.rows[0].total_quantity)
    });

  } catch (error) {
    console.error('Error en getCartCount:', error);
    res.status(500).json({ 
      error: 'Error al obtener contador del carrito' 
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount
};

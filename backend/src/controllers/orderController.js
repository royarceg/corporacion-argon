// =====================================================
// CONTROLADOR DE ÓRDENES DE COMPRA
// =====================================================

const pool = require('../config/database');
const emailService = require('../services/emailService');
const { 
  validateNumericId, 
  validateRequired,
  validateDate,
  validatePositiveNumber,
  validateLength,
  sanitizeString
} = require('../middleware/validators');

// =====================================================
// CREATE ORDER - Crear nueva orden de compra
// =====================================================
const createOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { client_id, id: user_id } = req.user;
    const { customer_po, wanted_date, items } = req.body;

    // Validar datos
    const errors = [];
    
    if (!validateRequired(customer_po)) {
      errors.push('customer_po es requerido');
    } else if (!validateLength(customer_po, 1, 100)) {
      errors.push('customer_po debe tener entre 1 y 100 caracteres');
    }
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      errors.push('items es requerido y debe contener al menos un producto');
    }
    
    if (wanted_date && !validateDate(wanted_date)) {
      errors.push('wanted_date debe tener formato YYYY-MM-DD');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Verificar que sea un cliente
    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden crear órdenes' 
      });
    }

    // Iniciar transacción
    await client.query('BEGIN');

    // Generar número de orden único
    const orderNumber = 'MIWO' + Date.now().toString().slice(-7);

    // Crear la orden
    const orderResult = await client.query(
      `INSERT INTO purchase_orders 
        (order_number, client_id, user_id, customer_po, wanted_date, status, subtotal_initial) 
       VALUES ($1, $2, $3, $4, $5, 'pending', 0) 
       RETURNING *`,
      [orderNumber, client_id, user_id, customer_po, wanted_date]
    );

    const order = orderResult.rows[0];
    let subtotal = 0;

    // Insertar items de la orden
    for (const item of items) {
      const { product_id, quantity } = item;

      // Obtener precio de referencia del producto
      const priceResult = await client.query(
        `SELECT price FROM client_product_prices 
         WHERE client_id = $1 AND product_id = $2`,
        [client_id, product_id]
      );

      const unit_price = priceResult.rows.length > 0 
        ? priceResult.rows[0].price 
        : 0;

      const line_total = quantity * unit_price;
      subtotal += line_total;

      // Insertar item
      await client.query(
        `INSERT INTO order_items 
          (purchase_order_id, product_id, quantity_requested, unit_price_initial, line_total_initial) 
         VALUES ($1, $2, $3, $4, $5)`,
        [order.id, product_id, quantity, unit_price, line_total]
      );
    }

    // Actualizar subtotal de la orden
    await client.query(
      'UPDATE purchase_orders SET subtotal_initial = $1 WHERE id = $2',
      [subtotal, order.id]
    );

    // Confirmar transacción
    await client.query('COMMIT');

    // Enviar email "Order Acknowledgement"
    try {
      await emailService.sendOrderAcknowledgement(order.id);
    } catch (emailError) {
      console.error('Error enviando email, pero la orden fue creada:', emailError);
      // No fallar la creación de la orden si el email falla
    }

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      order: {
        id: order.id,
        order_number: orderNumber,
        customer_po,
        subtotal
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en createOrder:', error);
    res.status(500).json({ 
      error: 'Error al crear orden' 
    });
  } finally {
    client.release();
  }
};

// =====================================================
// GET ORDERS - Obtener órdenes del cliente
// =====================================================
const getOrders = async (req, res) => {
  try {
    const { client_id } = req.user;

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden ver órdenes' 
      });
    }

    const result = await pool.query(
      `SELECT 
        po.id,
        po.order_number,
        po.customer_po,
        po.wanted_date,
        po.status,
        po.subtotal_initial,
        po.subtotal_confirmed,
        po.created_at,
        po.confirmed_at,
        u.user_name as created_by
      FROM purchase_orders po
      INNER JOIN users u ON po.user_id = u.id
      WHERE po.client_id = $1
      ORDER BY po.created_at DESC`,
      [client_id]
    );

    res.json({
      success: true,
      orders: result.rows
    });

  } catch (error) {
    console.error('Error en getOrders:', error);
    res.status(500).json({ 
      error: 'Error al obtener órdenes' 
    });
  }
};

// =====================================================
// GET ORDER BY ID - Obtener detalle de una orden
// =====================================================
const getOrderById = async (req, res) => {
  try {
    const { client_id } = req.user;
    const { id } = req.params;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de orden inválido' });
    }

    if (!client_id) {
      return res.status(403).json({ 
        error: 'Solo clientes pueden ver órdenes' 
      });
    }

    // Obtener información de la orden
    const orderResult = await pool.query(
      `SELECT 
        po.*,
        u.user_name as created_by,
        u.email as user_email,
        c.company_name,
        c.email as company_email,
        c.phone,
        c.address
      FROM purchase_orders po
      INNER JOIN users u ON po.user_id = u.id
      INNER JOIN clients c ON po.client_id = c.id
      WHERE po.id = $1 AND po.client_id = $2`,
      [id, client_id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Orden no encontrada' 
      });
    }

    const order = orderResult.rows[0];

    // Obtener items de la orden
    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.sku as product_sku,
        p.name as product_name,
        p.description
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.purchase_order_id = $1
      ORDER BY oi.id`,
      [id]
    );

    res.json({
      success: true,
      order: {
        ...order,
        items: itemsResult.rows
      }
    });

  } catch (error) {
    console.error('Error en getOrderById:', error);
    res.status(500).json({ 
      error: 'Error al obtener orden' 
    });
  }
};

// =====================================================
// CONFIRM ORDER (ADMIN) - Confirmar orden
// =====================================================
const confirmOrder = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const { items } = req.body;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de orden inválido' });
    }

    // Validar datos
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items es requerido y debe contener al menos un producto' });
    }

    await client.query('BEGIN');

    // Verificar que la orden existe y está pendiente
    const orderCheck = await client.query(
      'SELECT * FROM purchase_orders WHERE id = $1 AND status = $2',
      [id, 'pending']
    );

    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ 
        error: 'Orden no encontrada o ya confirmada' 
      });
    }

    const order = orderCheck.rows[0];
    let subtotal_confirmed = 0;

    // Actualizar items
    for (const item of items) {
      const { id: item_id, quantity_confirmed, unit_price_confirmed } = item;
      
      const line_total = quantity_confirmed * unit_price_confirmed;
      subtotal_confirmed += line_total;

      // Actualizar item
      await client.query(
        `UPDATE order_items 
         SET quantity_confirmed = $1, 
             unit_price_confirmed = $2, 
             line_total_confirmed = $3
         WHERE id = $4 AND purchase_order_id = $5`,
        [quantity_confirmed, unit_price_confirmed, line_total, item_id, id]
      );

      // Actualizar precio de referencia del cliente
      await client.query(
        `INSERT INTO client_product_prices (client_id, product_id, price, last_order_id, updated_at)
         VALUES ($1, (SELECT product_id FROM order_items WHERE id = $2), $3, $4, NOW())
         ON CONFLICT (client_id, product_id) 
         DO UPDATE SET 
           price = $3, 
           last_order_id = $4, 
           updated_at = NOW()`,
        [order.client_id, item_id, unit_price_confirmed, id]
      );
    }

    // Actualizar orden
    await client.query(
      `UPDATE purchase_orders 
       SET status = 'confirmed', 
           subtotal_confirmed = $1, 
           confirmed_at = NOW() 
       WHERE id = $2`,
      [subtotal_confirmed, id]
    );

    await client.query('COMMIT');

    // Enviar email "Order Confirmation"
    try {
      await emailService.sendOrderConfirmation(id);
    } catch (emailError) {
      console.error('Error enviando email, pero la orden fue confirmada:', emailError);
    }

    res.json({
      success: true,
      message: 'Orden confirmada exitosamente'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en confirmOrder:', error);
    res.status(500).json({ 
      error: 'Error al confirmar orden' 
    });
  } finally {
    client.release();
  }
};

// =====================================================
// GET ADMIN ORDER BY ID - Detalle de orden (sin filtro de client)
// =====================================================
const getAdminOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de orden inválido' });
    }

    const orderResult = await pool.query(
      `SELECT
        po.*,
        u.user_name as created_by,
        u.email as user_email,
        c.company_name,
        c.email as company_email,
        c.phone,
        c.address
      FROM purchase_orders po
      INNER JOIN users u ON po.user_id = u.id
      INNER JOIN clients c ON po.client_id = c.id
      WHERE po.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const order = orderResult.rows[0];

    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.sku,
        p.name as product_name
      FROM order_items oi
      INNER JOIN products p ON oi.product_id = p.id
      WHERE oi.purchase_order_id = $1
      ORDER BY oi.id`,
      [id]
    );

    res.json({
      success: true,
      order: { ...order, items: itemsResult.rows }
    });

  } catch (error) {
    console.error('Error en getAdminOrderById:', error);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
};

// =====================================================
// GET ALL ORDERS (ADMIN) - Ver todas las órdenes
// =====================================================
const getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT 
        po.id,
        po.order_number,
        po.customer_po,
        po.wanted_date,
        po.status,
        po.subtotal_initial,
        po.subtotal_confirmed,
        po.created_at,
        po.confirmed_at,
        c.company_name,
        u.user_name as created_by
      FROM purchase_orders po
      INNER JOIN clients c ON po.client_id = c.id
      INNER JOIN users u ON po.user_id = u.id
      ORDER BY po.created_at DESC`
    );

    res.json({
      success: true,
      orders: result.rows
    });

  } catch (error) {
    console.error('Error en getAllOrders:', error);
    res.status(500).json({ 
      error: 'Error al obtener órdenes' 
    });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getAdminOrderById,
  confirmOrder,
  getAllOrders
};

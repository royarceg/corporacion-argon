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
    const { customer_po, wanted_date, items, comments } = req.body;

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

    // Generar número de orden por cliente (prefijo desde DB)
    const prefixResult = await client.query(
      'SELECT order_prefix FROM clients WHERE id = $1',
      [client_id]
    );
    const prefix = prefixResult.rows[0]?.order_prefix || 'ORD';
    const countResult = await client.query(
      'SELECT COUNT(*) as total FROM purchase_orders WHERE client_id = $1',
      [client_id]
    );
    const nextNum = parseInt(countResult.rows[0].total) + 1;
    const orderNumber = `${prefix}-${nextNum}`;

    // Crear la orden
    const orderResult = await client.query(
      `INSERT INTO purchase_orders
        (order_number, client_id, user_id, customer_po, wanted_date, comments, status, subtotal_initial)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', 0)
       RETURNING *`,
      [orderNumber, client_id, user_id, customer_po, wanted_date, comments || '']
    );

    const order = orderResult.rows[0];
    let subtotal = 0;

    // Insertar items de la orden
    for (const item of items) {
      const { product_id, quantity, note } = item;

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
          (purchase_order_id, product_id, quantity_requested, unit_price_initial, line_total_initial, note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, product_id, quantity, unit_price, line_total, note || '']
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
        u.user_name as created_by,
        (SELECT pi.image_url
         FROM order_items oi2
         INNER JOIN products p2 ON oi2.product_id = p2.id
         LEFT JOIN product_images pi ON p2.id = pi.product_id
         WHERE oi2.purchase_order_id = po.id
         ORDER BY oi2.id ASC, pi.is_primary DESC, pi.display_order ASC
         LIMIT 1) as first_image_url,
        (SELECT COUNT(*) FROM order_items oi3 WHERE oi3.purchase_order_id = po.id) as items_count
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

    // Obtener items de la orden con imagen primaria
    const itemsResult = await pool.query(
      `SELECT
        oi.*,
        p.sku as product_sku,
        p.name as product_name,
        p.description,
        (SELECT image_url FROM product_images
         WHERE product_id = p.id
         ORDER BY is_primary DESC, display_order ASC
         LIMIT 1) as image_url
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
    const { items, admin_comments } = req.body;

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
           admin_comments = COALESCE($3, admin_comments),
           confirmed_at = NOW()
       WHERE id = $2`,
      [subtotal_confirmed, id, admin_comments || null]
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
        u.name as created_by_name,
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
        p.sku as product_sku,
        p.name as product_name,
        (SELECT image_url FROM product_images
         WHERE product_id = p.id
         ORDER BY is_primary DESC, display_order ASC
         LIMIT 1) as image_url
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

// =====================================================
// UPDATE ORDER - Editar orden pendiente (solo cliente)
// =====================================================
const updateOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { client_id } = req.user;
    const { id } = req.params;
    const { customer_po, wanted_date, items } = req.body;

    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de orden inválido' });
    }

    if (!client_id) {
      return res.status(403).json({ error: 'Solo clientes pueden editar órdenes' });
    }

    await client.query('BEGIN');

    // Verificar que la orden existe, pertenece al cliente y está pendiente
    const orderCheck = await client.query(
      'SELECT * FROM purchase_orders WHERE id = $1 AND client_id = $2 AND status = $3',
      [id, client_id, 'pending']
    );

    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Orden no encontrada o no editable' });
    }

    // Actualizar campos de cabecera si vienen
    if (customer_po || wanted_date !== undefined) {
      const updates = [];
      const vals = [];
      let idx = 1;
      if (customer_po) { updates.push(`customer_po = $${idx++}`); vals.push(customer_po); }
      if (wanted_date !== undefined) { updates.push(`wanted_date = $${idx++}`); vals.push(wanted_date || null); }
      vals.push(id);
      await client.query(
        `UPDATE purchase_orders SET ${updates.join(', ')} WHERE id = $${idx}`,
        vals
      );
    }

    // Si vienen items, actualizar cantidades
    if (items && Array.isArray(items)) {
      let subtotal = 0;

      for (const item of items) {
        const { id: item_id, quantity } = item;

        if (quantity <= 0) {
          // Eliminar item si cantidad = 0
          await client.query(
            'DELETE FROM order_items WHERE id = $1 AND purchase_order_id = $2',
            [item_id, id]
          );
        } else {
          // Actualizar cantidad
          const priceResult = await client.query(
            'SELECT unit_price_initial FROM order_items WHERE id = $1',
            [item_id]
          );
          const unit_price = priceResult.rows[0]?.unit_price_initial ?? 0;
          const line_total = quantity * parseFloat(unit_price);
          subtotal += line_total;

          await client.query(
            `UPDATE order_items
             SET quantity_requested = $1, line_total_initial = $2
             WHERE id = $3 AND purchase_order_id = $4`,
            [quantity, line_total, item_id, id]
          );
        }
      }

      // Recalcular subtotal sumando todos los items que quedaron
      const remainingResult = await client.query(
        'SELECT SUM(line_total_initial) as total FROM order_items WHERE purchase_order_id = $1',
        [id]
      );
      const newSubtotal = remainingResult.rows[0]?.total ?? 0;

      await client.query(
        'UPDATE purchase_orders SET subtotal_initial = $1 WHERE id = $2',
        [newSubtotal, id]
      );
    }

    await client.query('COMMIT');

    res.json({ success: true, message: 'Orden actualizada exitosamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en updateOrder:', error);
    res.status(500).json({ error: 'Error al actualizar orden' });
  } finally {
    client.release();
  }
};

// =====================================================
// DELETE ORDER - Eliminar orden pendiente (solo cliente)
// =====================================================
const deleteOrder = async (req, res) => {
  const client = await pool.connect();

  try {
    const { client_id } = req.user;
    const { id } = req.params;

    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de orden inválido' });
    }

    if (!client_id) {
      return res.status(403).json({ error: 'Solo clientes pueden eliminar órdenes' });
    }

    await client.query('BEGIN');

    // Verificar que la orden existe, pertenece al cliente y está pendiente
    const orderCheck = await client.query(
      'SELECT * FROM purchase_orders WHERE id = $1 AND client_id = $2 AND status = $3',
      [id, client_id, 'pending']
    );

    if (orderCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Orden no encontrada o no se puede eliminar' });
    }

    // Soft delete: marcar como cancelada (no se eliminan registros para trazabilidad)
    await client.query(
      `UPDATE purchase_orders SET status = 'cancelled' WHERE id = $1`,
      [id]
    );

    await client.query('COMMIT');

    res.json({ success: true, message: 'Orden cancelada exitosamente' });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error en deleteOrder:', error);
    res.status(500).json({ error: 'Error al eliminar orden' });
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getAdminOrderById,
  confirmOrder,
  getAllOrders,
  updateOrder,
  deleteOrder
};

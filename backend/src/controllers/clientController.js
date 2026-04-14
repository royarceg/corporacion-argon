// =====================================================
// CONTROLADOR DE CLIENTES
// Gestión de clientes y asignación de productos
// =====================================================

const pool = require('../config/database');
const { validateNumericId } = require('../middleware/validators');

// =====================================================
// GET ALL CLIENTS - Obtener todos los clientes
// =====================================================
const getAllClients = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        company_name,
        email,
        order_prefix,
        active
      FROM clients
      WHERE active = true
      ORDER BY company_name`
    );

    res.json({
      success: true,
      clients: result.rows
    });

  } catch (error) {
    console.error('Error en getAllClients:', error);
    res.status(500).json({ 
      error: 'Error al obtener clientes' 
    });
  }
};

// =====================================================
// GET CLIENT PRODUCTS - Obtener productos asignados a un cliente
// =====================================================
const getClientProducts = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validar ID
    if (!validateNumericId(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const result = await pool.query(
      `SELECT 
        cp.product_id,
        cp.active as assigned,
        p.sku,
        p.name,
        p.category
      FROM client_products cp
      INNER JOIN products p ON cp.product_id = p.id
      WHERE cp.client_id = $1
      ORDER BY p.name`,
      [clientId]
    );

    // Retornar solo los IDs de productos asignados
    const productIds = result.rows
      .filter(row => row.assigned)
      .map(row => row.product_id);

    res.json({
      success: true,
      product_ids: productIds
    });

  } catch (error) {
    console.error('Error en getClientProducts:', error);
    res.status(500).json({ 
      error: 'Error al obtener productos del cliente' 
    });
  }
};

// =====================================================
// ASSIGN PRODUCT TO CLIENT - Asignar un producto a un cliente
// =====================================================
const assignProductToClient = async (req, res) => {
  try {
    const { clientId, productId } = req.params;

    // Validar IDs
    if (!validateNumericId(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    if (!validateNumericId(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    // Verificar si ya existe la asignación
    const existingResult = await pool.query(
      `SELECT id FROM client_products 
       WHERE client_id = $1 AND product_id = $2`,
      [clientId, productId]
    );

    if (existingResult.rows.length > 0) {
      // Si existe, actualizar a activo
      await pool.query(
        `UPDATE client_products 
         SET active = true 
         WHERE client_id = $1 AND product_id = $2`,
        [clientId, productId]
      );
    } else {
      // Si no existe, crear nueva asignación
      await pool.query(
        `INSERT INTO client_products (client_id, product_id, active)
         VALUES ($1, $2, true)`,
        [clientId, productId]
      );
    }

    res.json({
      success: true,
      message: 'Producto asignado exitosamente'
    });

  } catch (error) {
    console.error('Error en assignProductToClient:', error);
    res.status(500).json({ 
      error: 'Error al asignar producto' 
    });
  }
};

// =====================================================
// UNASSIGN PRODUCT FROM CLIENT - Desasignar un producto de un cliente
// =====================================================
const unassignProductFromClient = async (req, res) => {
  try {
    const { clientId, productId } = req.params;

    // Validar IDs
    if (!validateNumericId(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }
    if (!validateNumericId(productId)) {
      return res.status(400).json({ error: 'ID de producto inválido' });
    }

    await pool.query(
      `UPDATE client_products 
       SET active = false 
       WHERE client_id = $1 AND product_id = $2`,
      [clientId, productId]
    );

    res.json({
      success: true,
      message: 'Producto desasignado exitosamente'
    });

  } catch (error) {
    console.error('Error en unassignProductFromClient:', error);
    res.status(500).json({ 
      error: 'Error al desasignar producto' 
    });
  }
};

// =====================================================
// ASSIGN ALL PRODUCTS TO CLIENT - Asignar todos los productos a un cliente
// =====================================================
const assignAllProductsToClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validar ID
    if (!validateNumericId(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    // Obtener todos los productos activos
    const productsResult = await pool.query(
      `SELECT id FROM products WHERE active = true`
    );

    // Asignar cada producto
    for (const product of productsResult.rows) {
      // Verificar si ya existe
      const existingResult = await pool.query(
        `SELECT id FROM client_products 
         WHERE client_id = $1 AND product_id = $2`,
        [clientId, product.id]
      );

      if (existingResult.rows.length > 0) {
        // Actualizar a activo
        await pool.query(
          `UPDATE client_products 
           SET active = true 
           WHERE client_id = $1 AND product_id = $2`,
          [clientId, product.id]
        );
      } else {
        // Crear nueva asignación
        await pool.query(
          `INSERT INTO client_products (client_id, product_id, active)
           VALUES ($1, $2, true)`,
          [clientId, product.id]
        );
      }
    }

    res.json({
      success: true,
      message: 'Todos los productos asignados exitosamente',
      count: productsResult.rows.length
    });

  } catch (error) {
    console.error('Error en assignAllProductsToClient:', error);
    res.status(500).json({ 
      error: 'Error al asignar todos los productos' 
    });
  }
};

// =====================================================
// UNASSIGN ALL PRODUCTS FROM CLIENT - Desasignar todos los productos de un cliente
// =====================================================
const unassignAllProductsFromClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validar ID
    if (!validateNumericId(clientId)) {
      return res.status(400).json({ error: 'ID de cliente inválido' });
    }

    const result = await pool.query(
      `UPDATE client_products 
       SET active = false 
       WHERE client_id = $1`,
      [clientId]
    );

    res.json({
      success: true,
      message: 'Todos los productos desasignados exitosamente',
      count: result.rowCount
    });

  } catch (error) {
    console.error('Error en unassignAllProductsFromClient:', error);
    res.status(500).json({ 
      error: 'Error al desasignar todos los productos' 
    });
  }
};

// =====================================================
// CREATE CLIENT - Crear nueva empresa cliente
// =====================================================
const createClient = async (req, res) => {
  try {
    const { company_name, contact_name, email, phone, address, order_prefix } = req.body;

    if (!company_name || !company_name.trim()) {
      return res.status(400).json({ error: 'company_name es requerido' });
    }
    if (!order_prefix || !order_prefix.trim()) {
      return res.status(400).json({ error: 'order_prefix es requerido (ej: OCD, OK9)' });
    }

    // Verificar que el prefijo no esté en uso
    const existing = await pool.query('SELECT id FROM clients WHERE order_prefix = $1', [order_prefix.trim().toUpperCase()]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Ese prefijo ya está en uso por otro cliente' });
    }

    const result = await pool.query(
      `INSERT INTO clients (company_name, contact_name, email, phone, address, order_prefix, active)
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING id, company_name, contact_name, email, phone, address, order_prefix, active`,
      [
        company_name.trim(),
        contact_name?.trim() || null,
        email?.trim() || null,
        phone?.trim() || null,
        address?.trim() || null,
        order_prefix.trim().toUpperCase(),
      ]
    );

    res.status(201).json({ success: true, client: result.rows[0] });

  } catch (error) {
    console.error('Error en createClient:', error);
    res.status(500).json({ error: 'Error al crear empresa' });
  }
};

module.exports = {
  getAllClients,
  createClient,
  getClientProducts,
  assignProductToClient,
  unassignProductFromClient,
  assignAllProductsToClient,
  unassignAllProductsFromClient
};

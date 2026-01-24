// =====================================================
// CONTROLADOR DE CLIENTES
// Gestión de clientes y asignación de productos
// =====================================================

const pool = require('../config/database');

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

module.exports = {
  getAllClients,
  getClientProducts,
  assignProductToClient,
  unassignProductFromClient,
  assignAllProductsToClient,
  unassignAllProductsFromClient
};

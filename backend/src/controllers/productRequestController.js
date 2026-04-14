const pool = require('../config/database');

// POST /api/product-requests — Cliente crea solicitud
const createRequest = async (req, res) => {
  try {
    const { id: user_id, client_id } = req.user;
    const { title, description, image_url } = req.body;

    if (!title || !title.trim()) return res.status(400).json({ error: 'El título es requerido' });
    if (!description || !description.trim()) return res.status(400).json({ error: 'La descripción es requerida' });

    const result = await pool.query(
      `INSERT INTO product_requests (user_id, client_id, title, description, image_url)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, client_id || null, title.trim(), description.trim(), image_url || null]
    );

    res.status(201).json({ success: true, request: result.rows[0] });
  } catch (error) {
    console.error('Error en createRequest:', error);
    res.status(500).json({ error: 'Error al crear solicitud' });
  }
};

// GET /api/product-requests — Cliente ve sus solicitudes
const getMyRequests = async (req, res) => {
  try {
    const { id: user_id } = req.user;
    const result = await pool.query(
      `SELECT * FROM product_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [user_id]
    );
    res.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('Error en getMyRequests:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

// GET /api/product-requests/admin/all — Admin ve todas
const getAllRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT pr.*, u.user_name, u.name as user_full_name, c.company_name
       FROM product_requests pr
       LEFT JOIN users u ON pr.user_id = u.id
       LEFT JOIN clients c ON pr.client_id = c.id
       ORDER BY pr.created_at DESC`
    );
    res.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('Error en getAllRequests:', error);
    res.status(500).json({ error: 'Error al obtener solicitudes' });
  }
};

// PUT /api/product-requests/admin/:id — Admin responde
const respondToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, admin_response } = req.body;
    await pool.query(
      `UPDATE product_requests SET status = COALESCE($1, status), admin_response = COALESCE($2, admin_response), updated_at = NOW() WHERE id = $3`,
      [status || null, admin_response || null, id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error en respondToRequest:', error);
    res.status(500).json({ error: 'Error al responder solicitud' });
  }
};

module.exports = { createRequest, getMyRequests, getAllRequests, respondToRequest };

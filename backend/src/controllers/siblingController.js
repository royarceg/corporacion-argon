const pool = require('../config/database');

// GET /api/siblings/groups — Listar todos los grupos con sus productos
const getGroups = async (req, res) => {
  try {
    const groups = await pool.query(
      `SELECT g.id, g.name,
              json_agg(json_build_object(
                'product_id', p.id,
                'sku', p.sku,
                'name', p.name,
                'image', (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1),
                'color', (SELECT pv.color FROM product_variants pv WHERE pv.product_id = p.id LIMIT 1)
              ) ORDER BY p.name) AS products
       FROM product_sibling_groups g
       JOIN product_siblings s ON s.group_id = g.id
       JOIN products p ON p.id = s.product_id
       GROUP BY g.id, g.name
       ORDER BY g.name`
    );
    res.json({ groups: groups.rows });
  } catch (error) {
    console.error('Error getGroups:', error);
    res.status(500).json({ error: 'Error al obtener grupos.' });
  }
};

// POST /api/siblings/groups — Crear grupo
const createGroup = async (req, res) => {
  try {
    const { name, product_ids } = req.body;
    if (!name || !product_ids?.length) {
      return res.status(400).json({ error: 'Nombre y al menos 2 product_ids son requeridos.' });
    }

    const result = await pool.query(
      'INSERT INTO product_sibling_groups (name) VALUES ($1) RETURNING *',
      [name]
    );
    const group = result.rows[0];

    for (const pid of product_ids) {
      await pool.query(
        'INSERT INTO product_siblings (group_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [group.id, pid]
      );
    }

    res.status(201).json({ success: true, group });
  } catch (error) {
    console.error('Error createGroup:', error);
    res.status(500).json({ error: 'Error al crear grupo.' });
  }
};

// PUT /api/siblings/groups/:id — Actualizar grupo (nombre + productos)
const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, product_ids } = req.body;

    if (name) {
      await pool.query('UPDATE product_sibling_groups SET name = $1 WHERE id = $2', [name, id]);
    }

    if (product_ids) {
      await pool.query('DELETE FROM product_siblings WHERE group_id = $1', [id]);
      for (const pid of product_ids) {
        await pool.query(
          'INSERT INTO product_siblings (group_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, pid]
        );
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updateGroup:', error);
    res.status(500).json({ error: 'Error al actualizar grupo.' });
  }
};

// DELETE /api/siblings/groups/:id — Eliminar grupo
const deleteGroup = async (req, res) => {
  try {
    await pool.query('DELETE FROM product_sibling_groups WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleteGroup:', error);
    res.status(500).json({ error: 'Error al eliminar grupo.' });
  }
};

// GET /api/siblings/product/:productId — Obtener hermanos de un producto (para frontend)
const getSiblingsForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(
      `SELECT p.id, p.sku, p.name,
              (SELECT pi.image_url FROM product_images pi WHERE pi.product_id = p.id ORDER BY pi.display_order LIMIT 1) AS image,
              (SELECT pv.color FROM product_variants pv WHERE pv.product_id = p.id LIMIT 1) AS color
       FROM product_siblings s1
       JOIN product_siblings s2 ON s2.group_id = s1.group_id AND s2.product_id != s1.product_id
       JOIN products p ON p.id = s2.product_id
       WHERE s1.product_id = $1
       ORDER BY p.name`,
      [productId]
    );
    res.json({ siblings: result.rows });
  } catch (error) {
    console.error('Error getSiblingsForProduct:', error);
    res.status(500).json({ error: 'Error al obtener siblings.' });
  }
};

module.exports = { getGroups, createGroup, updateGroup, deleteGroup, getSiblingsForProduct };

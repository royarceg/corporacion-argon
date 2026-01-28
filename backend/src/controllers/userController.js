const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const {
  validateRequired,
  validateEmail,
  validateRole,
  validatePassword,
  validateNumericId,
  validateUsername,
  validateLength
} = require('../middleware/validators');

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id, 
        client_id, 
        user_name, 
        email, 
        role, 
        active,
        created_at,
        updated_at
      FROM users 
      ORDER BY created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuarios',
      details: error.message 
    });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    const result = await pool.query(`
      SELECT 
        id, 
        client_id, 
        user_name, 
        email, 
        role, 
        active,
        created_at,
        updated_at
      FROM users 
      WHERE id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ 
      error: 'Error al obtener usuario',
      details: error.message 
    });
  }
};

// Resetear contraseña de un usuario
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Validar contraseña
    if (!validateRequired(newPassword)) {
      return res.status(400).json({ error: 'Se requiere una nueva contraseña' });
    }
    
    if (!validatePassword(newPassword)) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Verificar que el usuario existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña
    await pool.query(
      'UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2',
      [hashedPassword, id]
    );

    res.json({ 
      success: true, 
      message: 'Contraseña reseteada exitosamente' 
    });
  } catch (error) {
    console.error('Error al resetear contraseña:', error);
    res.status(500).json({ 
      error: 'Error al resetear contraseña',
      details: error.message 
    });
  }
};

// Actualizar estado activo/inactivo de un usuario
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Verificar que el usuario existe
    const userCheck = await pool.query('SELECT id, active FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Actualizar el estado
    const result = await pool.query(
      'UPDATE users SET active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, active',
      [active, id]
    );

    res.json({ 
      success: true, 
      message: `Usuario ${active ? 'activado' : 'desactivado'} exitosamente`,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar estado del usuario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar estado del usuario',
      details: error.message 
    });
  }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
  try {
    const { client_id, user_name, email, password, role } = req.body;

    // Validaciones
    const errors = [];
    
    if (!validateRequired(user_name)) {
      errors.push('Nombre de usuario es requerido');
    } else if (!validateUsername(user_name)) {
      errors.push('Nombre de usuario debe ser alfanumérico (3-50 caracteres)');
    }
    
    if (!validateRequired(email)) {
      errors.push('Email es requerido');
    } else if (!validateEmail(email)) {
      errors.push('Formato de email inválido');
    }
    
    if (!validateRequired(password)) {
      errors.push('Contraseña es requerida');
    } else if (!validatePassword(password)) {
      errors.push('Contraseña debe tener al menos 6 caracteres');
    }
    
    if (!validateRequired(role)) {
      errors.push('Rol es requerido');
    } else if (!validateRole(role)) {
      errors.push('Rol no válido. Debe ser client_user o master_admin');
    }
    
    if (client_id && !validateNumericId(client_id)) {
      errors.push('ID de cliente inválido');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Verificar si el usuario ya existe
    const userExists = await pool.query(
      'SELECT id FROM users WHERE user_name = $1 OR email = $2',
      [user_name, email]
    );

    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'El usuario o email ya existe' });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el nuevo usuario
    const result = await pool.query(
      `INSERT INTO users (client_id, user_name, email, password, role, active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, true, NOW(), NOW()) 
       RETURNING id, client_id, user_name, email, role, active, created_at`,
      [client_id || null, user_name, email, hashedPassword, role]
    );

    res.status(201).json({ 
      success: true, 
      message: 'Usuario creado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ 
      error: 'Error al crear usuario',
      details: error.message 
    });
  }
};

// Actualizar información de un usuario
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, user_name } = req.body;

    // Validar ID
    if (!validateNumericId(id)) {
      return res.status(400).json({ error: 'ID de usuario inválido' });
    }

    // Validaciones de campos
    const errors = [];
    
    if (user_name && !validateUsername(user_name)) {
      errors.push('Nombre de usuario debe ser alfanumérico (3-50 caracteres)');
    }
    
    if (email && !validateEmail(email)) {
      errors.push('Formato de email inválido');
    }
    
    if (name && !validateLength(name, 1, 255)) {
      errors.push('Nombre debe tener entre 1 y 255 caracteres');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // Verificar que el usuario existe
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Verificar si el email o user_name ya están en uso por otro usuario
    const duplicateCheck = await pool.query(
      'SELECT id FROM users WHERE (email = $1 OR user_name = $2) AND id != $3',
      [email, user_name, id]
    );

    if (duplicateCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El email o nombre de usuario ya está en uso' });
    }

    // Actualizar el usuario
    const result = await pool.query(
      `UPDATE users 
       SET name = $1, email = $2, user_name = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, client_id, user_name, name, email, role, active, created_at, updated_at`,
      [name, email, user_name, id]
    );

    res.json({ 
      success: true, 
      message: 'Usuario actualizado exitosamente',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      error: 'Error al actualizar usuario',
      details: error.message 
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  resetUserPassword,
  toggleUserStatus,
  createUser,
  updateUser
};

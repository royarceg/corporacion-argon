// =====================================================
// CONTROLADOR DE AUTENTICACIÓN
// =====================================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const {
  validateRequired,
  validateEmail,
  validateRole,
  validatePassword,
  validateLength,
  validateUsername
} = require('../middleware/validators');

// =====================================================
// LOGIN - Iniciar sesión
// =====================================================
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validar que vengan los datos
    const errors = [];
    
    if (!validateRequired(username)) {
      errors.push('Usuario es requerido');
    }
    if (!validateRequired(password)) {
      errors.push('Contraseña es requerida');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Buscar usuario en la base de datos por user_name
    const result = await pool.query(
      'SELECT * FROM users WHERE user_name = $1',
      [username]
    );

    // Si no existe el usuario
    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    const user = result.rows[0];

    // Verificar si el usuario está activo
    if (!user.active) {
      return res.status(401).json({ 
        error: 'Usuario inactivo. Contacta al administrador.' 
      });
    }

    // 3. Verificar la contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Credenciales incorrectas' 
      });
    }

    // 4. Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        user_name: user.user_name,
        email: user.email,
        role: user.role,
        client_id: user.client_id
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // El token expira en 24 horas
    );

    // 5. Responder con el token y datos del usuario
    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        user_name: user.user_name,
        name: user.name || user.user_name, // Nombre completo o user_name como fallback
        email: user.email,
        role: user.role,
        client_id: user.client_id
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión. Intenta nuevamente.' 
    });
  }
};

// =====================================================
// REGISTER - Registrar nuevo usuario (solo admin)
// =====================================================
const register = async (req, res) => {
  try {
    const { client_id, user_name, email, password, role } = req.body;

    // 1. Validar datos
    const errors = [];
    
    if (!validateRequired(user_name)) {
      errors.push('Nombre de usuario es requerido');
    } else if (!validateUsername(user_name)) {
      errors.push('Nombre de usuario debe ser alfanumérico (3-50 caracteres)');
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
    
    if (email && !validateEmail(email)) {
      errors.push('Formato de email inválido');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }

    // 2. Verificar si el user_name ya existe
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE user_name = $1',
      [user_name]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ 
        error: 'El nombre de usuario ya está registrado' 
      });
    }

    // 3. Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insertar usuario en la base de datos
    const result = await pool.query(
      `INSERT INTO users (client_id, user_name, email, password, role) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, user_name, email, role, client_id`,
      [client_id, user_name, email, hashedPassword, role]
    );

    const newUser = result.rows[0];

    // 5. Responder con el usuario creado
    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      error: 'Error al registrar usuario' 
    });
  }
};

// =====================================================
// VERIFY TOKEN - Verificar si el token es válido
// =====================================================
const verifyTokenRoute = async (req, res) => {
  // Si llegó aquí, el token ya fue verificado por el middleware
  res.json({
    success: true,
    user: req.user
  });
};

// =====================================================
// REQUEST RESET - Solicitar restablecimiento de contraseña
// =====================================================
const crypto = require('crypto');

const requestReset = async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || !username.trim()) {
      return res.status(400).json({ error: 'Usuario es requerido' });
    }

    const result = await pool.query(
      'SELECT id, user_name, active FROM users WHERE user_name = $1',
      [username.trim()]
    );

    // Respuesta genérica para no revelar si el usuario existe
    if (result.rows.length === 0 || !result.rows[0].active) {
      return res.json({ success: true, message: 'Si el usuario existe, recibirás instrucciones.' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600 * 1000); // 1 hora

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, user.id]
    );

    res.json({ success: true, token, message: 'Token generado correctamente.' });

  } catch (error) {
    console.error('Error en requestReset:', error);
    res.status(500).json({ error: 'Error al procesar la solicitud.' });
  }
};

// =====================================================
// RESET PASSWORD - Establecer nueva contraseña con token
// =====================================================
const resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ error: 'Token y nueva contraseña son requeridos.' });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'El enlace es inválido o ya expiró.' });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, result.rows[0].id]
    );

    res.json({ success: true, message: 'Contraseña actualizada exitosamente.' });

  } catch (error) {
    console.error('Error en resetPassword:', error);
    res.status(500).json({ error: 'Error al actualizar la contraseña.' });
  }
};

module.exports = {
  login,
  register,
  verifyTokenRoute,
  requestReset,
  resetPassword,
};

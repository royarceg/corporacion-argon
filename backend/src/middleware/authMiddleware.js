// =====================================================
// MIDDLEWARE DE AUTENTICACIÓN
// =====================================================

const jwt = require('jsonwebtoken');

// Verificar si el usuario tiene un token válido
const verifyToken = (req, res, next) => {
  // 1. Buscar el token en los headers
  const token = req.headers['authorization'];

  // Si no hay token, rechazar
  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso denegado. No hay token.' 
    });
  }

  try {
    // 2. Remover la palabra "Bearer" del token
    // Ejemplo: "Bearer abc123xyz" -> "abc123xyz"
    const tokenWithoutBearer = token.replace('Bearer ', '');

    // 3. Verificar que el token sea válido
    const decoded = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);

    // 4. Guardar información del usuario en la petición
    // Ahora cualquier ruta puede saber quién es el usuario
    req.user = decoded;

    // 5. Continuar con la siguiente función
    next();

  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido o expirado' 
    });
  }
};

// Alias para compatibilidad
const authenticateToken = verifyToken;

// Verificar si el usuario es administrador
const verifyAdmin = (req, res, next) => {
  // Primero debe pasar por verifyToken
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado' 
    });
  }

  // Verificar si es admin
  if (req.user.role !== 'master_admin') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Solo administradores.' 
    });
  }

  next();
};

// Alias para compatibilidad
const isMasterAdmin = verifyAdmin;

// Verificar si el usuario es cliente
const verifyClient = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      error: 'No autenticado' 
    });
  }

  if (req.user.role !== 'client_user') {
    return res.status(403).json({ 
      error: 'Acceso denegado. Solo clientes.' 
    });
  }

  next();
};

module.exports = {
  verifyToken,
  authenticateToken,
  verifyAdmin,
  isMasterAdmin,
  verifyClient
};

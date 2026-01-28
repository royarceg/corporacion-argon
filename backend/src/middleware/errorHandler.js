// =====================================================
// MIDDLEWARE CENTRALIZADO DE ERRORES
// Maneja todos los errores de la aplicación de forma consistente
// =====================================================

/**
 * Clase para errores personalizados de la aplicación
 * Permite crear errores con código de estado HTTP específico
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distingue errores esperados de errores de programación
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Errores comunes pre-definidos para usar en controladores
 */
const Errors = {
  // 400 - Bad Request
  badRequest: (message = 'Datos inválidos') => new AppError(message, 400),
  
  // 401 - Unauthorized
  unauthorized: (message = 'No autorizado') => new AppError(message, 401),
  
  // 403 - Forbidden
  forbidden: (message = 'Acceso denegado') => new AppError(message, 403),
  
  // 404 - Not Found
  notFound: (message = 'Recurso no encontrado') => new AppError(message, 404),
  
  // 409 - Conflict
  conflict: (message = 'El recurso ya existe') => new AppError(message, 409),
  
  // 422 - Unprocessable Entity
  validation: (message = 'Error de validación') => new AppError(message, 422),
  
  // 500 - Internal Server Error
  internal: (message = 'Error interno del servidor') => new AppError(message, 500)
};

/**
 * Middleware principal de manejo de errores
 * Debe registrarse DESPUÉS de todas las rutas en server.js
 */
const errorHandler = (err, req, res, next) => {
  // Valores por defecto
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  
  // Log del error (siempre en servidor)
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    statusCode,
    message: err.message,
    // Solo incluir stack en desarrollo
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  // Color del log según severidad
  if (statusCode >= 500) {
    console.error('❌ ERROR:', JSON.stringify(logData, null, 2));
  } else if (statusCode >= 400) {
    console.warn('⚠️ WARNING:', JSON.stringify(logData, null, 2));
  }

  // Errores específicos de PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // unique_violation
        statusCode = 409;
        message = 'El registro ya existe';
        break;
      case '23503': // foreign_key_violation
        statusCode = 400;
        message = 'Referencia inválida';
        break;
      case '22P02': // invalid_text_representation
        statusCode = 400;
        message = 'Formato de dato inválido';
        break;
      case 'ECONNREFUSED':
        statusCode = 503;
        message = 'Servicio no disponible';
        break;
    }
  }

  // Errores de JWT
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Respuesta al cliente
  const response = {
    success: false,
    error: message
  };

  // En desarrollo, incluir detalles adicionales
  if (process.env.NODE_ENV === 'development') {
    response.details = {
      originalMessage: err.message,
      stack: err.stack
    };
  }

  res.status(statusCode).json(response);
};

/**
 * Wrapper para controladores async
 * Captura errores automáticamente y los pasa al errorHandler
 * 
 * Uso:
 *   router.get('/', asyncHandler(async (req, res) => {
 *     // código que puede fallar
 *   }));
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Middleware para rutas no encontradas
 * Debe registrarse DESPUÉS de todas las rutas pero ANTES del errorHandler
 */
const notFoundHandler = (req, res, next) => {
  const error = new AppError(`Ruta no encontrada: ${req.method} ${req.path}`, 404);
  next(error);
};

module.exports = {
  AppError,
  Errors,
  errorHandler,
  asyncHandler,
  notFoundHandler
};

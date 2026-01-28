// =====================================================
// VALIDADORES CENTRALIZADOS
// Funciones reutilizables para validar inputs
// =====================================================

/**
 * Valida que un valor exista y no esté vacío
 * @param {any} value - Valor a validar
 * @returns {boolean}
 */
const validateRequired = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  return true;
};

/**
 * Valida formato de email
 * @param {string} email - Email a validar
 * @returns {boolean}
 */
const validateEmail = (email) => {
  if (!email) return false;
  // Regex simple pero efectivo para emails
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valida que el rol sea uno de los permitidos
 * @param {string} role - Rol a validar
 * @returns {boolean}
 */
const validateRole = (role) => {
  const allowedRoles = ['client_user', 'master_admin'];
  return allowedRoles.includes(role);
};

/**
 * Valida que sea un ID numérico positivo
 * @param {any} id - ID a validar
 * @returns {boolean}
 */
const validateNumericId = (id) => {
  const num = parseInt(id, 10);
  return !isNaN(num) && num > 0 && String(num) === String(id);
};

/**
 * Valida longitud de un string
 * @param {string} str - String a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {boolean}
 */
const validateLength = (str, min = 0, max = Infinity) => {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
};

/**
 * Valida contraseña (mínimo 6 caracteres)
 * @param {string} password - Contraseña a validar
 * @returns {boolean}
 */
const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
};

/**
 * Valida que sea un número positivo (para cantidades, precios)
 * @param {any} value - Valor a validar
 * @returns {boolean}
 */
const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

/**
 * Valida que sea un número no negativo (incluye 0)
 * @param {any} value - Valor a validar
 * @returns {boolean}
 */
const validateNonNegativeNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Sanitiza un string removiendo caracteres peligrosos
 * @param {string} str - String a sanitizar
 * @returns {string}
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .trim()
    .replace(/[<>]/g, '') // Remueve < y > para prevenir HTML injection
    .substring(0, 10000);  // Limita a 10,000 caracteres máximo
};

/**
 * Valida formato de fecha (YYYY-MM-DD)
 * @param {string} dateStr - Fecha a validar
 * @returns {boolean}
 */
const validateDate = (dateStr) => {
  if (!dateStr) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date);
};

/**
 * Valida username (alfanumérico con guiones bajos, 3-50 caracteres)
 * @param {string} username - Username a validar
 * @returns {boolean}
 */
const validateUsername = (username) => {
  if (!username || typeof username !== 'string') return false;
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * Valida SKU (alfanumérico con guiones, 2-50 caracteres)
 * @param {string} sku - SKU a validar
 * @returns {boolean}
 */
const validateSku = (sku) => {
  if (!sku || typeof sku !== 'string') return false;
  const skuRegex = /^[a-zA-Z0-9\-]{2,50}$/;
  return skuRegex.test(sku);
};

// =====================================================
// MIDDLEWARE DE VALIDACIÓN
// Para usar directamente en rutas
// =====================================================

/**
 * Middleware que valida que los params sean IDs numéricos
 * Uso: router.get('/:id', validateParamIds(['id']), controller)
 */
const validateParamIds = (paramNames) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const param of paramNames) {
      if (req.params[param] && !validateNumericId(req.params[param])) {
        errors.push(`${param} debe ser un número válido`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  };
};

/**
 * Middleware que valida campos requeridos en el body
 * Uso: router.post('/', validateRequiredFields(['name', 'email']), controller)
 */
const validateRequiredFields = (fieldNames) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const field of fieldNames) {
      if (!validateRequired(req.body[field])) {
        errors.push(`${field} es requerido`);
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({ errors });
    }
    
    next();
  };
};

// =====================================================
// EXPORTAR FUNCIONES
// =====================================================

module.exports = {
  // Funciones de validación
  validateRequired,
  validateEmail,
  validateRole,
  validateNumericId,
  validateLength,
  validatePassword,
  validatePositiveNumber,
  validateNonNegativeNumber,
  validateDate,
  validateUsername,
  validateSku,
  
  // Utilidades
  sanitizeString,
  
  // Middlewares
  validateParamIds,
  validateRequiredFields
};

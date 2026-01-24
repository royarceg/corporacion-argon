// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// =====================================================
// RUTAS PÚBLICAS (no requieren autenticación)
// =====================================================

// POST /api/auth/login
// Iniciar sesión
router.post('/login', authController.login);

// =====================================================
// RUTAS PROTEGIDAS (requieren autenticación)
// =====================================================

// GET /api/auth/verify
// Verificar si el token es válido
router.get('/verify', verifyToken, authController.verifyTokenRoute);

// =====================================================
// RUTAS DE ADMINISTRADOR (solo admin)
// =====================================================

// POST /api/auth/register
// Registrar nuevo usuario (solo admin puede crear usuarios)
router.post('/register', verifyToken, verifyAdmin, authController.register);

module.exports = router;

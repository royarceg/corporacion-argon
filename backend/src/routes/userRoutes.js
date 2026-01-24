const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isMasterAdmin } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y rol de master_admin
router.use(authenticateToken);
router.use(isMasterAdmin);

// Obtener todos los usuarios
router.get('/', userController.getAllUsers);

// Obtener un usuario por ID
router.get('/:id', userController.getUserById);

// Actualizar usuario
router.put('/:id', userController.updateUser);

// Resetear contraseña de un usuario
router.put('/:id/reset-password', userController.resetUserPassword);

// Activar/Desactivar usuario
router.put('/:id/toggle-status', userController.toggleUserStatus);

// Crear nuevo usuario
router.post('/', userController.createUser);

module.exports = router;

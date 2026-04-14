// =====================================================
// RUTAS DE CLIENTES
// =====================================================

const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// =====================================================
// RUTAS DE ADMINISTRADOR
// =====================================================

// GET /api/clients
// Obtener todos los clientes (solo admin)
router.get('/', verifyToken, verifyAdmin, clientController.getAllClients);

// POST /api/clients
// Crear nueva empresa cliente (solo admin)
router.post('/', verifyToken, verifyAdmin, clientController.createClient);

// GET /api/clients/:clientId/products
// Obtener productos asignados a un cliente (solo admin)
router.get('/:clientId/products', verifyToken, verifyAdmin, clientController.getClientProducts);

// POST /api/clients/:clientId/products/:productId
// Asignar un producto a un cliente (solo admin)
router.post('/:clientId/products/:productId', verifyToken, verifyAdmin, clientController.assignProductToClient);

// DELETE /api/clients/:clientId/products/:productId
// Desasignar un producto de un cliente (solo admin)
router.delete('/:clientId/products/:productId', verifyToken, verifyAdmin, clientController.unassignProductFromClient);

// POST /api/clients/:clientId/products/assign-all
// Asignar todos los productos a un cliente (solo admin)
router.post('/:clientId/products/assign-all', verifyToken, verifyAdmin, clientController.assignAllProductsToClient);

// POST /api/clients/:clientId/products/unassign-all
// Desasignar todos los productos de un cliente (solo admin)
router.post('/:clientId/products/unassign-all', verifyToken, verifyAdmin, clientController.unassignAllProductsFromClient);

module.exports = router;

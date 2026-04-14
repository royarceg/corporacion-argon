// =====================================================
// RUTAS DE ÓRDENES DE COMPRA
// =====================================================

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// =====================================================
// RUTAS DE CLIENTES
// =====================================================

// POST /api/orders
// Crear nueva orden de compra
router.post('/', verifyToken, orderController.createOrder);

// GET /api/orders
// Obtener órdenes del cliente
router.get('/', verifyToken, orderController.getOrders);

// GET /api/orders/:id
// Obtener detalle de una orden específica
router.get('/:id', verifyToken, orderController.getOrderById);

// =====================================================
// RUTAS DE ADMINISTRADOR
// =====================================================

// GET /api/orders/admin/all
// Ver todas las órdenes del sistema (solo admin)
router.get('/admin/all', verifyToken, verifyAdmin, orderController.getAllOrders);

// GET /api/orders/admin/:id
// Detalle de una orden específica (solo admin, sin filtro de cliente)
router.get('/admin/:id', verifyToken, verifyAdmin, orderController.getAdminOrderById);

// PUT /api/orders/:id/confirm
// Confirmar orden (solo admin)
router.put('/:id/confirm', verifyToken, verifyAdmin, orderController.confirmOrder);

module.exports = router;

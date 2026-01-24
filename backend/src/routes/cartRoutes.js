// =====================================================
// RUTAS DE CARRITO DE COMPRAS
// =====================================================

const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// =====================================================
// RUTAS DE CARRITO
// =====================================================

// GET /api/cart
// Obtener carrito del usuario con todos los items
router.get('/', cartController.getCart);

// GET /api/cart/count
// Obtener cantidad de items en el carrito (para badge)
router.get('/count', cartController.getCartCount);

// POST /api/cart
// Agregar producto al carrito
// Body: { product_id: number, variant_id?: number, quantity: number }
router.post('/', cartController.addToCart);

// PUT /api/cart/:cart_item_id
// Actualizar cantidad de un item
// Body: { quantity: number }
router.put('/:cart_item_id', cartController.updateCartItem);

// DELETE /api/cart/:cart_item_id
// Eliminar item del carrito
router.delete('/:cart_item_id', cartController.removeFromCart);

// DELETE /api/cart
// Vaciar todo el carrito
router.delete('/', cartController.clearCart);

module.exports = router;

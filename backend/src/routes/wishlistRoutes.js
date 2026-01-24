// =====================================================
// RUTAS DE WISHLIST (LISTA DE DESEOS)
// =====================================================

const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { verifyToken } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// =====================================================
// RUTAS DE WISHLIST
// =====================================================

// GET /api/wishlist
// Obtener lista de deseos del usuario
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist
// Agregar producto a la lista de deseos
// Body: { product_id: number }
router.post('/', wishlistController.addToWishlist);

// DELETE /api/wishlist/:product_id
// Eliminar producto de la lista de deseos
router.delete('/:product_id', wishlistController.removeFromWishlist);

// GET /api/wishlist/check/:product_id
// Verificar si un producto está en la wishlist
router.get('/check/:product_id', wishlistController.checkWishlist);

module.exports = router;

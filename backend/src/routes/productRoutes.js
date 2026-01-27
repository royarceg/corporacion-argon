// =====================================================
// RUTAS DE PRODUCTOS V2
// =====================================================

const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// =====================================================
// RUTAS DE ADMINISTRADOR (deben ir primero)
// =====================================================

// GET /api/products/admin/all
// Ver todos los productos del sistema (solo admin)
router.get('/admin/all', verifyToken, verifyAdmin, productController.getAllProducts);

// GET /api/products/admin/:id
// Ver detalle completo de un producto (solo admin)
router.get('/admin/:id', verifyToken, verifyAdmin, productController.getProductByIdAdmin);

// PUT /api/products/admin/:id
// Actualizar producto (solo admin)
router.put('/admin/:id', verifyToken, verifyAdmin, productController.updateProduct);

// POST /api/products/admin
// Crear nuevo producto (solo admin)
router.post('/admin', verifyToken, verifyAdmin, productController.createProduct);

// DELETE /api/products/admin/:id
// Eliminar producto (solo admin)
router.delete('/admin/:id', verifyToken, verifyAdmin, productController.deleteProduct);

// =====================================================
// RUTAS DE CLIENTES
// =====================================================

// GET /api/products/search
// Búsqueda difusa de productos (tolerante a errores de tipeo)
router.get('/search', verifyToken, productController.searchProducts);

// GET /api/products
// Obtener productos asignados al cliente
router.get('/', verifyToken, productController.getProducts);

// GET /api/products/category/:category
// Filtrar productos por categoría
router.get('/category/:category', verifyToken, productController.getProductsByCategory);

// GET /api/products/:id
// Obtener detalle de un producto específico
router.get('/:id', verifyToken, productController.getProductById);

module.exports = router;

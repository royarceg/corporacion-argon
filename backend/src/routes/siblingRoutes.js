const express = require('express');
const router = express.Router();
const siblingController = require('../controllers/siblingController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Client: obtener hermanos de un producto (para mostrar colores alternos)
router.get('/product/:productId', verifyToken, siblingController.getSiblingsForProduct);

// Admin: CRUD de grupos
router.get('/groups', verifyToken, verifyAdmin, siblingController.getGroups);
router.post('/groups', verifyToken, verifyAdmin, siblingController.createGroup);
router.put('/groups/:id', verifyToken, verifyAdmin, siblingController.updateGroup);
router.delete('/groups/:id', verifyToken, verifyAdmin, siblingController.deleteGroup);

module.exports = router;

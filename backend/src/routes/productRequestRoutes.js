const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productRequestController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

router.post('/', verifyToken, ctrl.createRequest);
router.get('/', verifyToken, ctrl.getMyRequests);
router.get('/admin/all', verifyToken, verifyAdmin, ctrl.getAllRequests);
router.put('/admin/:id', verifyToken, verifyAdmin, ctrl.respondToRequest);

module.exports = router;

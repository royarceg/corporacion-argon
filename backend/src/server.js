// =====================================================
// SERVIDOR PRINCIPAL - CORPORACIÓN ARGOM
// =====================================================

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARES
// =====================================================

// CORS = permite que el frontend (React) hable con el backend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Permite recibir JSON en las peticiones
app.use(express.json());

// Permite recibir datos de formularios
app.use(express.urlencoded({ extended: true }));

// =====================================================
// RUTAS
// =====================================================

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Corporación Argom funcionando',
    version: '1.0.0'
  });
});

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const cartRoutes = require('./routes/cartRoutes');
const clientRoutes = require('./routes/clientRoutes');
const userRoutes = require('./routes/userRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// =====================================================
// MANEJO DE ERRORES
// =====================================================

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error general
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`☁️  Cloudinary: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado ✓' : 'No configurado ✗'}`);
});

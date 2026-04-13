// =====================================================
// SERVIDOR PRINCIPAL - CORPORACIÓN ARGON
// =====================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARES
// =====================================================

// Helmet = agrega headers de seguridad HTTP
app.use(helmet());

// CORS = permite que el frontend (React) hable con el backend
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Permite recibir JSON en las peticiones
app.use(express.json());

// Permite recibir datos de formularios
app.use(express.urlencoded({ extended: true }));

// =====================================================
// RATE LIMITING (Protección contra fuerza bruta)
// =====================================================

// Limitador para login: máximo 20 intentos por minuto por IP
const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 20, // 20 intentos
  message: {
    error: 'Demasiados intentos de inicio de sesión. Intenta de nuevo en 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Aplicar limitador solo a la ruta de login
app.use('/api/auth/login', loginLimiter);

// =====================================================
// RUTAS
// =====================================================

// Health Check - Railway usa esto para verificar que el servicio está vivo
// IMPORTANTE: Debe estar ANTES de las rutas protegidas
const pool = require('./config/database');

app.get('/health', async (req, res) => {
  try {
    // Verificar conexión a la base de datos
    const dbCheck = await pool.query('SELECT 1');
    
    res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: dbCheck ? 'up' : 'down'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        api: 'up',
        database: 'down'
      },
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection failed'
    });
  }
});

// Ruta de información de la API
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Corporación Argon funcionando',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    health: '/health'
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
// MANEJO DE ERRORES CENTRALIZADO
// =====================================================

const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Ruta no encontrada (debe ir DESPUÉS de todas las rutas)
app.use(notFoundHandler);

// Manejador de errores (debe ir AL FINAL de todo)
app.use(errorHandler);

// =====================================================
// INICIAR SERVIDOR
// =====================================================

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('\n========================================');
  console.log('✅ CORPORACIÓN ARGON - API');
  console.log('========================================');
  console.log(`🚀 Servidor:     Puerto ${PORT}`);
  console.log(`🌐 Ambiente:     ${process.env.NODE_ENV || 'development'}`);
  console.log(`📡 Frontend:     ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`☁️  Cloudinary:   ${process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado ✓' : 'No configurado ✗'}`);
  console.log(`📊 Health:       /health`);
  console.log('========================================\n');
});

// =====================================================
// GRACEFUL SHUTDOWN
// Permite que Railway cierre el servidor limpiamente
// =====================================================

const gracefulShutdown = (signal) => {
  console.log(`\n⚠️  Recibida señal ${signal}. Cerrando servidor...`);
  
  server.close(() => {
    console.log('🔌 Servidor HTTP cerrado');
    
    // Cerrar conexión a la base de datos
    pool.end(() => {
      console.log('🗄️  Pool de PostgreSQL cerrado');
      console.log('✅ Cierre limpio completado\n');
      process.exit(0);
    });
  });

  // Si no cierra en 10 segundos, forzar cierre
  setTimeout(() => {
    console.error('❌ Forzando cierre después de 10s');
    process.exit(1);
  }, 10000);
};

// Escuchar señales de cierre
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Railway/Docker
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C local

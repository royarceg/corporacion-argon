// =====================================================
// CONFIGURACIÓN DE CONEXIÓN A POSTGRESQL
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

// Pool = Piscina de conexiones
// En vez de abrir/cerrar una conexión cada vez (lento),
// mantiene varias conexiones abiertas y reutilizables (rápido)

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 5, // Máximo 5 conexiones simultáneas (optimizado para B2B)
  min: 0, // Sin conexiones mínimas - libera recursos cuando no hay uso
  idleTimeoutMillis: 15000, // Cierra conexiones inactivas después de 15 segundos
  connectionTimeoutMillis: 10000, // Timeout de 10 segundos si no puede conectar
});

// Verificar conexión SOLO al iniciar (no en cada query)
let connected = false;
pool.on('connect', () => {
  if (!connected) {
    console.log('✅ Conectado a PostgreSQL');
    connected = true;
  }
});

pool.on('error', (err) => {
  console.error('❌ Error en conexión a PostgreSQL:', err);
  // No salir del proceso, solo loguear
  connected = false;
});

// Graceful shutdown
process.on('SIGTERM', () => {
  pool.end(() => {
    console.log('🔌 Pool de PostgreSQL cerrado');
    process.exit(0);
  });
});

module.exports = pool;

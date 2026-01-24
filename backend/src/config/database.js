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
  max: 20, // Máximo 20 conexiones simultáneas
  idleTimeoutMillis: 30000, // Cierra conexiones inactivas después de 30 segundos
  connectionTimeoutMillis: 10000, // Timeout de 10 segundos si no puede conectar
});

// Verificar conexión al iniciar
pool.on('connect', () => {
  console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
  console.error('❌ Error en conexión a PostgreSQL:', err);
  process.exit(-1);
});

module.exports = pool;

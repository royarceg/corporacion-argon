// =====================================================
// CONFIGURACIÓN DE CONEXIÓN A POSTGRESQL
// =====================================================

const { Pool } = require('pg');
require('dotenv').config();

// Pool = Piscina de conexiones
// En vez de abrir/cerrar una conexión cada vez (lento),
// mantiene varias conexiones abiertas y reutilizables (rápido)

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
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

module.exports = pool;

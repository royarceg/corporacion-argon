// =====================================================
// SCRIPT DE VERIFICACIÓN DE CONEXIONES A POSTGRESQL
// =====================================================

require('dotenv').config();
const { Pool } = require('pg');

// Crear un pool temporal solo para esta consulta
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 1, // Solo necesitamos 1 conexión para consultar
});

async function checkConnections() {
  console.log('\n🔍 VERIFICANDO CONEXIONES A POSTGRESQL...\n');
  
  try {
    // Consulta 1: Información general del servidor
    const serverInfo = await pool.query(`
      SELECT version(), current_database(), current_user;
    `);
    
    console.log('📊 INFORMACIÓN DEL SERVIDOR:');
    console.log('Base de datos:', serverInfo.rows[0].current_database);
    console.log('Usuario:', serverInfo.rows[0].current_user);
    console.log('');

    // Consulta 2: Límite de conexiones
    const limitQuery = await pool.query(`
      SHOW max_connections;
    `);
    
    console.log('⚙️  LÍMITES DE CONEXIONES:');
    console.log('Máximo permitido por PostgreSQL:', limitQuery.rows[0].max_connections);
    console.log('');

    // Consulta 3: Conexiones activas AHORA
    const activeConnections = await pool.query(`
      SELECT 
        COUNT(*) as total_conexiones,
        COUNT(*) FILTER (WHERE state = 'active') as conexiones_activas,
        COUNT(*) FILTER (WHERE state = 'idle') as conexiones_idle
      FROM pg_stat_activity
      WHERE datname = current_database();
    `);

    console.log('📈 ESTADO ACTUAL:');
    console.log('Total de conexiones:', activeConnections.rows[0].total_conexiones);
    console.log('Conexiones activas (ejecutando queries):', activeConnections.rows[0].conexiones_activas);
    console.log('Conexiones idle (esperando):', activeConnections.rows[0].conexiones_idle);
    console.log('');

    // Consulta 4: Detalle de conexiones por aplicación
    const connectionDetails = await pool.query(`
      SELECT 
        application_name,
        state,
        COUNT(*) as cantidad,
        MAX(backend_start) as ultima_conexion
      FROM pg_stat_activity
      WHERE datname = current_database()
      GROUP BY application_name, state
      ORDER BY cantidad DESC;
    `);

    console.log('📋 DETALLE POR APLICACIÓN:');
    console.log('─────────────────────────────────────────────────────');
    connectionDetails.rows.forEach(row => {
      console.log(`Aplicación: ${row.application_name || 'desconocida'}`);
      console.log(`  Estado: ${row.state}`);
      console.log(`  Cantidad: ${row.cantidad}`);
      console.log(`  Última conexión: ${row.ultima_conexion}`);
      console.log('');
    });

    // Consulta 5: Verificar si hay queries lentas
    const slowQueries = await pool.query(`
      SELECT 
        pid,
        application_name,
        state,
        EXTRACT(EPOCH FROM (now() - query_start)) as duracion_segundos,
        LEFT(query, 100) as query_preview
      FROM pg_stat_activity
      WHERE datname = current_database()
        AND state = 'active'
        AND query NOT ILIKE '%pg_stat_activity%'
      ORDER BY query_start ASC
      LIMIT 5;
    `);

    if (slowQueries.rows.length > 0) {
      console.log('⚠️  QUERIES ACTIVAS EN ESTE MOMENTO:');
      console.log('─────────────────────────────────────────────────────');
      slowQueries.rows.forEach(row => {
        console.log(`PID: ${row.pid}`);
        console.log(`Duración: ${row.duracion_segundos.toFixed(2)} segundos`);
        console.log(`Query: ${row.query_preview}...`);
        console.log('');
      });
    } else {
      console.log('✅ No hay queries lentas en este momento');
      console.log('');
    }

    // Resumen final
    const total = parseInt(activeConnections.rows[0].total_conexiones);
    const limite = parseInt(limitQuery.rows[0].max_connections);
    const porcentaje = ((total / limite) * 100).toFixed(1);

    console.log('─────────────────────────────────────────────────────');
    console.log('📊 RESUMEN:');
    console.log(`Uso actual: ${total}/${limite} conexiones (${porcentaje}%)`);
    console.log('');

    if (total < limite * 0.5) {
      console.log('✅ ESTADO: SALUDABLE - Muchas conexiones disponibles');
    } else if (total < limite * 0.8) {
      console.log('⚠️  ESTADO: ADVERTENCIA - Uso moderado de conexiones');
    } else {
      console.log('🚨 ESTADO: CRÍTICO - Cerca del límite de conexiones');
    }

    console.log('─────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error al verificar conexiones:', error.message);
    process.exit(1);
  } finally {
    // Cerrar el pool
    await pool.end();
    console.log('🔌 Conexión de verificación cerrada correctamente\n');
    process.exit(0);
  }
}

// Ejecutar verificación
checkConnections();

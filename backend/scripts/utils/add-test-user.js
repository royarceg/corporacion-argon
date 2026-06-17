// =====================================================
// Crea un usuario de prueba para validar el reset por email.
// Idempotente: si el cliente o el usuario ya existen, no los duplica.
// Uso: node scripts/utils/add-test-user.js
// =====================================================
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const COMPANY = 'Testing';
const USER_NAME = 'gustavo_test';
const NAME = 'Gustavo Cerdas';
const EMAIL = 'gcerdas16@gmail.com';
const TEMP_PASSWORD = 'ArgonTest2026!';
const ROLE = 'client_user';

(async () => {
  try {
    // 1) Cliente "Testing" (idempotente)
    let clientRes = await pool.query('SELECT id FROM clients WHERE company_name = $1', [COMPANY]);
    let clientId;
    if (clientRes.rows.length) {
      clientId = clientRes.rows[0].id;
      console.log(`Cliente "${COMPANY}" ya existe (id ${clientId})`);
    } else {
      clientRes = await pool.query(
        'INSERT INTO clients (company_name, email, active) VALUES ($1, $2, true) RETURNING id',
        [COMPANY, EMAIL]
      );
      clientId = clientRes.rows[0].id;
      console.log(`✅ Cliente "${COMPANY}" creado (id ${clientId})`);
    }

    // 2) Usuario de prueba (idempotente)
    const userRes = await pool.query('SELECT id FROM users WHERE user_name = $1', [USER_NAME]);
    if (userRes.rows.length) {
      console.log(`Usuario "${USER_NAME}" ya existe (id ${userRes.rows[0].id}). No se crea de nuevo.`);
    } else {
      const hash = await bcrypt.hash(TEMP_PASSWORD, 10);
      const ins = await pool.query(
        `INSERT INTO users (client_id, user_name, name, email, password, role, active)
         VALUES ($1, $2, $3, $4, $5, $6, true) RETURNING id`,
        [clientId, USER_NAME, NAME, EMAIL, hash, ROLE]
      );
      console.log(`✅ Usuario "${USER_NAME}" creado (id ${ins.rows[0].id})`);
      console.log(`   Email: ${EMAIL}`);
      console.log(`   Contraseña temporal: ${TEMP_PASSWORD} (cambiala con el reset)`);
    }
  } catch (e) {
    console.error('❌ Error:', e.message);
  } finally {
    await pool.end();
  }
})();

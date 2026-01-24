// Script para generar hashes de contraseñas
const bcrypt = require('bcryptjs');

async function generateHashes() {
  // Contraseña para admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  // Contraseña para todos los clientes
  const clientPassword = await bcrypt.hash('password123', 10);
  
  console.log('=== HASHES DE CONTRASEÑAS ===\n');
  console.log('Admin (admin123):');
  console.log(adminPassword);
  console.log('\nClientes (password123):');
  console.log(clientPassword);
  console.log('\n=== SQL PARA ACTUALIZAR ===\n');
  console.log(`UPDATE users SET password = '${adminPassword}' WHERE user_name = 'admin_master';`);
  console.log(`UPDATE users SET password = '${clientPassword}' WHERE role = 'client_user';`);
}

generateHashes();

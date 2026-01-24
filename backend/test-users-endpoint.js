// Script para probar el endpoint de usuarios
const fetch = require('node-fetch');

const API_URL = 'http://localhost:5000/api';

async function testUsersEndpoint() {
  console.log('🧪 Probando endpoint de usuarios...\n');

  try {
    // Primero hacer login para obtener el token
    console.log('1️⃣ Haciendo login como admin...');
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin_master',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error('Error en login: ' + loginResponse.status);
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login exitoso');
    console.log('Token:', loginData.token.substring(0, 20) + '...\n');

    // Ahora probar el endpoint de usuarios
    console.log('2️⃣ Obteniendo lista de usuarios...');
    const usersResponse = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${loginData.token}`
      }
    });

    if (!usersResponse.ok) {
      const errorText = await usersResponse.text();
      throw new Error(`Error obteniendo usuarios: ${usersResponse.status} - ${errorText}`);
    }

    const users = await usersResponse.json();
    console.log('✅ Usuarios obtenidos exitosamente');
    console.log(`Total de usuarios: ${users.length}\n`);
    
    console.log('📋 Lista de usuarios:');
    users.forEach(user => {
      console.log(`  - ${user.user_name} (${user.email}) - Rol: ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testUsersEndpoint();

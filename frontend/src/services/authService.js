import api from './api';

const authService = {
  // Iniciar sesión
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al iniciar sesión' };
    }
  },

  // Verificar token
  verifyToken: async () => {
    try {
      const response = await api.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Token inválido' };
    }
  },

  // Registrar usuario (solo admin)
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al registrar usuario' };
    }
  },
};

export default authService;

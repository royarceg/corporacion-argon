import api from './api';

const orderService = {
  // Crear orden de compra
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al crear orden' };
    }
  },

  // Obtener órdenes del cliente
  getOrders: async () => {
    try {
      const response = await api.get('/orders');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener órdenes' };
    }
  },

  // Obtener orden por ID
  getOrderById: async (id) => {
    try {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener orden' };
    }
  },

  // Obtener todas las órdenes (solo admin)
  getAllOrders: async () => {
    try {
      const response = await api.get('/orders/admin/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener órdenes' };
    }
  },

  // Confirmar orden (solo admin)
  confirmOrder: async (id, items) => {
    try {
      const response = await api.put(`/orders/${id}/confirm`, { items });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al confirmar orden' };
    }
  },
};

export default orderService;

import api from './api';

const productService = {
  // Obtener productos del cliente
  getProducts: async () => {
    try {
      const response = await api.get('/products');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener productos' };
    }
  },

  // Obtener producto por ID
  getProductById: async (id) => {
    try {
      const response = await api.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener producto' };
    }
  },

  // Obtener producto por ID (Admin)
  getProductByIdAdmin: async (id) => {
    try {
      const response = await api.get(`/products/admin/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener producto' };
    }
  },

  // Obtener todos los productos (solo admin)
  getAllProducts: async () => {
    try {
      const response = await api.get('/products/admin/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al obtener productos' };
    }
  },

  // Actualizar producto (Admin)
  updateProduct: async (id, productData) => {
    try {
      const response = await api.put(`/products/admin/${id}`, productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al actualizar producto' };
    }
  },

  // Crear producto (Admin)
  createProduct: async (productData) => {
    try {
      const response = await api.post('/products/admin', productData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al crear producto' };
    }
  },

  // Búsqueda difusa de productos (tolerante a errores de tipeo)
  searchProducts: async (query, threshold = 60) => {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&threshold=${threshold}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Error al buscar productos' };
    }
  },
};

export default productService;

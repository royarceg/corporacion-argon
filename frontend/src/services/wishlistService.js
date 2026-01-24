import api from './api';

const wishlistService = {
  // Obtener wishlist del usuario
  getWishlist: async () => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  // Agregar producto a wishlist
  addToWishlist: async (productId) => {
    const response = await api.post('/wishlist', { product_id: productId });
    return response.data;
  },

  // Eliminar producto de wishlist
  removeFromWishlist: async (productId) => {
    const response = await api.delete(`/wishlist/${productId}`);
    return response.data;
  },

  // Verificar si producto está en wishlist
  checkWishlist: async (productId) => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data;
  }
};

export default wishlistService;

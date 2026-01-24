import api from './api';

const cartService = {
  // Obtener carrito del usuario
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  // Obtener contador del carrito
  getCartCount: async () => {
    const response = await api.get('/cart/count');
    return response.data;
  },

  // Agregar producto al carrito
  addToCart: async (productId, variantId, quantity) => {
    const response = await api.post('/cart', {
      product_id: productId,
      variant_id: variantId,
      quantity: quantity
    });
    return response.data;
  },

  // Actualizar cantidad de un item
  updateCartItem: async (cartItemId, quantity) => {
    const response = await api.put(`/cart/${cartItemId}`, { quantity });
    return response.data;
  },

  // Eliminar item del carrito
  removeFromCart: async (cartItemId) => {
    const response = await api.delete(`/cart/${cartItemId}`);
    return response.data;
  },

  // Vaciar carrito
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  }
};

export default cartService;

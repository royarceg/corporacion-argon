import { useState, useEffect } from 'react';

const STORAGE_KEY = 'recently_viewed_products';
const MAX_ITEMS = 12; // Guardar hasta 12 productos vistos recientemente

export const useRecentlyViewed = () => {
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Cargar productos vistos recientemente del localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentlyViewed(parsed);
      }
    } catch (error) {
      console.error('Error al cargar productos vistos recientemente:', error);
    }
  }, []);

  // Agregar un producto al historial
  const addToRecentlyViewed = (product) => {
    try {
      // Crear una copia simplificada del producto (solo lo necesario)
      const simplifiedProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.image_url || product.images?.[0],
        category: product.category
      };

      // Obtener lista actual
      const stored = localStorage.getItem(STORAGE_KEY);
      let current = stored ? JSON.parse(stored) : [];

      // Remover el producto si ya existe (para moverlo al inicio)
      current = current.filter(p => p.id !== product.id);

      // Agregar al inicio
      current.unshift(simplifiedProduct);

      // Limitar a MAX_ITEMS
      if (current.length > MAX_ITEMS) {
        current = current.slice(0, MAX_ITEMS);
      }

      // Guardar en localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
      setRecentlyViewed(current);
    } catch (error) {
      console.error('Error al guardar producto visto recientemente:', error);
    }
  };

  // Obtener productos vistos recientemente excluyendo el actual
  const getRecentlyViewed = (currentProductId = null) => {
    if (currentProductId) {
      return recentlyViewed.filter(p => p.id !== currentProductId);
    }
    return recentlyViewed;
  };

  // Limpiar historial
  const clearRecentlyViewed = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setRecentlyViewed([]);
    } catch (error) {
      console.error('Error al limpiar productos vistos recientemente:', error);
    }
  };

  return {
    recentlyViewed,
    addToRecentlyViewed,
    getRecentlyViewed,
    clearRecentlyViewed
  };
};

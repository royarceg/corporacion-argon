import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import ClientWelcomeBar from '../components/ClientWelcomeBar';
import ClientNavbar from '../components/ClientNavbar';
import CategoryMenu from '../components/CategoryMenu';
import ClientProductCard from '../components/ClientProductCard';
import ProductModal from '../components/ProductModal';
import Toast from '../components/Toast';
import FilterPanel from '../components/FilterPanel';
import ProductCarousel from '../components/ProductCarousel';
import productService from '../services/productService';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';
import { useRecentlyViewed } from '../hooks/useRecentlyViewed';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());
  const [searchParams] = useSearchParams();
  
  // Estado para Toast
  const [toastVisible, setToastVisible] = useState(false);
  const [toastData, setToastData] = useState({ productName: '', productImage: '' });

  // Hook para productos vistos recientemente
  const { getRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    loadProducts();
    loadWishlistCount();
    loadCartCount();
    
    // Manejar parámetro de búsqueda de URL
    const search = searchParams.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  // Filtrado local (fallback) - función regular porque usa products y selectedCategory
  const filterProductsLocally = (query) => {
    let filtered = products;

    // Filtrar por categoría
    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    // Filtrar por búsqueda local
    if (query.trim()) {
      const q = query.toLowerCase();
      filtered = filtered.filter(p => 
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
    }

    setFilteredProducts(filtered);
    setDisplayedProducts(filtered);
  };

  // Filtrar solo por categoría
  const filterProductsByCategory = useCallback(() => {
    let filtered = products;

    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProducts(filtered);
    setDisplayedProducts(filtered);
  }, [products, selectedCategory]);

  // Búsqueda difusa usando el backend
  const performFuzzySearch = useCallback(async (query) => {
    if (!query.trim()) {
      filterProductsByCategory();
      return;
    }

    setSearching(true);
    try {
      const response = await productService.searchProducts(query, 60);
      let results = response.products || [];

      // Filtrar por categoría si no es "Todos"
      if (selectedCategory !== 'Todos') {
        results = results.filter(p => p.category === selectedCategory);
      }

      setFilteredProducts(results);
      setDisplayedProducts(results);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      // Si falla el fuzzy search, usar filtrado local como fallback
      filterProductsLocally(query);
    } finally {
      setSearching(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, products, filterProductsByCategory]);

  // Usar fuzzy search cuando hay búsqueda activa
  useEffect(() => {
    if (searchQuery.trim()) {
      performFuzzySearch(searchQuery);
    } else {
      filterProductsByCategory();
    }
  }, [selectedCategory, products, searchQuery, performFuzzySearch, filterProductsByCategory]);

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
      setProducts(response.products);
      setFilteredProducts(response.products);
      setDisplayedProducts(response.products);
    } catch (err) {
      setError(err.error || 'Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadWishlistCount = async () => {
    try {
      const response = await wishlistService.getWishlist();
      const wishlistItems = response.wishlist || [];
      setWishlistCount(wishlistItems.length);
      // Guardar los IDs de productos en wishlist
      const ids = new Set(wishlistItems.map(item => item.product_id));
      setWishlistProductIds(ids);
    } catch (err) {
      console.error('Error al cargar wishlist:', err);
    }
  };

  const loadCartCount = async () => {
    try {
      const response = await cartService.getCartCount();
      setCartCount(response.items_count || 0);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
    }
  };

  const handleCategorySelect = (category, search = null) => {
    if (search) {
      // Es una búsqueda
      setSearchQuery(search);
      setSelectedCategory('Todos');
    } else {
      // Es una categoría
      setSelectedCategory(category);
      setSearchQuery('');
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSearchQuery('');
  };

  const handleAddToWishlist = async (productId, isAdding) => {
    try {
      if (isAdding) {
        // Agregar a wishlist
        await wishlistService.addToWishlist(productId);
        console.log('Producto agregado a wishlist');
      } else {
        // Quitar de wishlist
        await wishlistService.removeFromWishlist(productId);
        console.log('Producto quitado de wishlist');
      }
      // Actualizar contador y lista de IDs
      loadWishlistCount();
    } catch (err) {
      console.error('Error al actualizar wishlist:', err);
      alert('Error al actualizar lista de deseos');
    }
  };

  const handleQuickAdd = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleAddToCart = async (cartData) => {
    try {
      const response = await cartService.addToCart(
        cartData.product_id,
        cartData.variant_id,
        cartData.quantity
      );
      console.log('Producto agregado al carrito:', response);
      
      // Actualizar contador
      loadCartCount();
      
      // Encontrar el producto agregado para mostrar en el toast
      const addedProduct = products.find(p => p.id === cartData.product_id);
      
      // Mostrar toast de confirmación
      setToastData({
        productName: addedProduct?.name || 'Producto',
        productImage: addedProduct?.image_url || addedProduct?.images?.[0] || null
      });
      setToastVisible(true);
      
    } catch (err) {
      console.error('Error al agregar al carrito:', err);
      alert('Error al agregar al carrito');
    }
  };

  const handleFilterChange = (filtered) => {
    setDisplayedProducts(filtered);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Obtener productos sugeridos (aleatorios de diferentes categorías)
  const getSuggestedProducts = () => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  if (loading) {
    return (
      <>
        <ClientWelcomeBar />
        <ClientNavbar 
          wishlistCount={wishlistCount} 
          cartCount={cartCount}
          onCategorySelect={handleCategorySelect}
        />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Cargando productos...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <ClientWelcomeBar />
      <ClientNavbar 
        wishlistCount={wishlistCount} 
        cartCount={cartCount}
        onCategorySelect={handleCategorySelect}
      />
      <CategoryMenu 
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="mx-auto flex gap-8" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px', paddingTop: '40px', paddingBottom: '40px' }}>
        {/* Panel de filtros a la izquierda */}
        <FilterPanel 
          products={filteredProducts} 
          onFilterChange={handleFilterChange}
        />

        {/* Contenido principal */}
        <div className="flex-1">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Mostrar si hay búsqueda activa */}
          {searchQuery && (
            <div className="mb-6 flex items-center gap-3">
              <p className="text-gray-600">
                Resultados de búsqueda para: <span className="font-semibold">"{searchQuery}"</span>
                {!searching && displayedProducts.length > 0 && ` (${displayedProducts.length} productos)`}
              </p>
              {searching && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
              )}
            </div>
          )}

          {searching ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '14px',
                  color: 'rgb(102, 102, 102)'
                }}
              >
                Buscando productos...
              </p>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="text-center py-12">
              <p
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 200,
                  color: 'rgb(102, 102, 102)',
                  fontSize: '16px',
                  lineHeight: '24px'
                }}
              >
                {searchQuery 
                  ? `No se encontraron productos para "${searchQuery}"`
                  : 'No hay productos disponibles con los filtros seleccionados'
                }
              </p>
            </div>
          ) : (
            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(4, 246px)',
                justifyContent: 'start'
              }}
            >
              {displayedProducts.map((product) => (
                <ClientProductCard
                  key={product.id}
                  product={product}
                  onAddToWishlist={handleAddToWishlist}
                  onQuickAdd={handleQuickAdd}
                  isInWishlist={wishlistProductIds.has(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Secciones de productos relacionados */}
      {!loading && !searching && products.length > 0 && (
        <div className="mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px', paddingBottom: '40px' }}>
          {/* También podría interesarte */}
          <ProductCarousel 
            title="También podría interesarte" 
            products={getSuggestedProducts()} 
          />
          
          {/* Visto recientemente */}
          {getRecentlyViewed().length > 0 && (
            <ProductCarousel 
              title="Visto recientemente" 
              products={getRecentlyViewed()} 
            />
          )}
        </div>
      )}

      {/* Modal de producto */}
      <ProductModal
        product={selectedProduct}
        isOpen={isModalOpen}
        onClose={closeModal}
        onAddToCart={handleAddToCart}
      />
      
      {/* Toast de confirmación */}
      <Toast
        message="Producto añadido al carrito"
        productName={toastData.productName}
        productImage={toastData.productImage}
        isVisible={toastVisible}
        onClose={() => setToastVisible(false)}
      />
    </>
  );
};

export default ProductCatalog;

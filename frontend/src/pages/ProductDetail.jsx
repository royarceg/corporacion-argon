import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ClientWelcomeBar from '../components/ClientWelcomeBar';
import ClientNavbar from '../components/ClientNavbar';
import productService from '../services/productService';
import wishlistService from '../services/wishlistService';
import cartService from '../services/cartService';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  const loadProduct = useCallback(async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      console.log('=== DEBUG PRODUCTO ===');
      console.log('Producto completo:', response.product);
      console.log('Videos:', response.product.videos);
      console.log('VideosByColor:', response.product.videosByColor);
      console.log('VideosWithColors:', response.product.videosWithColors);
      setProduct(response.product);
      
      // Pre-seleccionar primer color y talla
      if (response.product.available_colors?.length > 0) {
        setSelectedColor(response.product.available_colors[0]);
      }
      if (response.product.available_sizes?.length > 0) {
        setSelectedSize(response.product.available_sizes[0]);
      }
    } catch (err) {
      setError(err.error || 'Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadWishlistCount = async () => {
    try {
      const response = await wishlistService.getWishlist();
      setWishlistCount(response.wishlist?.length || 0);
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

  const checkIfInWishlist = useCallback(async () => {
    try {
      const response = await wishlistService.getWishlist();
      const wishlistItems = response.wishlist || [];
      const inWishlist = wishlistItems.some(item => item.product_id === parseInt(id));
      setIsInWishlist(inWishlist);
    } catch (err) {
      console.error('Error al verificar wishlist:', err);
    }
  }, [id]);

  useEffect(() => {
    loadProduct();
    loadWishlistCount();
    loadCartCount();
    checkIfInWishlist();
  }, [id, loadProduct, checkIfInWishlist]);

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      alert('Por favor selecciona color y talla');
      return;
    }

    setAddingToCart(true);
    try {
      await cartService.addToCart({
        product_id: product.id,
        variant_id: null,
        quantity
      });
      
      // Recargar contador del carrito
      await loadCartCount();
      
      alert('Producto agregado al carrito');
    } catch (err) {
      alert(err.error || 'Error al agregar al carrito');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    setAddingToWishlist(true);
    try {
      if (isInWishlist) {
        await wishlistService.removeFromWishlist(product.id);
        setIsInWishlist(false);
      } else {
        await wishlistService.addToWishlist(product.id);
        setIsInWishlist(true);
      }
      await loadWishlistCount();
    } catch (err) {
      alert(err.error || 'Error al actualizar wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (!error) {
      navigate('/checkout');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Obtener imágenes filtradas por color seleccionado
  const getFilteredImages = () => {
    if (!product) return [];
    
    console.log('=== getFilteredImages ===');
    console.log('Color seleccionado:', selectedColor);
    console.log('product.imagesByColor:', product.imagesByColor);
    console.log('product.images (generales):', product.images);
    
    // Si hay imágenes agrupadas por color Y hay un color seleccionado
    if (product.imagesByColor && selectedColor) {
      // Verificar si existe el color en imagesByColor
      if (product.imagesByColor[selectedColor]) {
        console.log('Retornando imágenes del color', selectedColor, ':', product.imagesByColor[selectedColor]);
        return product.imagesByColor[selectedColor];
      } else {
        // El color seleccionado NO tiene imágenes asignadas
        console.log('NO hay imágenes para el color', selectedColor);
        return []; // Retornar array vacío en lugar de mostrar otras imágenes
      }
    }
    
    // Si NO hay color seleccionado, mostrar imágenes generales
    const generalImages = product.images && product.images.length > 0 
      ? product.images 
      : [product.image_url].filter(Boolean);
    
    console.log('Retornando imágenes generales:', generalImages);
    return generalImages.length > 0 ? generalImages : ['/assets/images/Nuevo1.png'];
  };
  
  // Obtener videos filtrados por color seleccionado
  const getFilteredVideos = () => {
    if (!product) return [];
    
    console.log('=== getFilteredVideos ===');
    console.log('Color seleccionado:', selectedColor);
    console.log('product.videosByColor:', product.videosByColor);
    console.log('product.videosWithColors:', product.videosWithColors);
    console.log('product.videos:', product.videos);
    
    // Si hay videos agrupados por color Y hay un color seleccionado
    if (product.videosByColor && selectedColor) {
      // Verificar si existe el color en videosByColor
      if (product.videosByColor[selectedColor]) {
        console.log('Retornando videos del color', selectedColor);
        return product.videosByColor[selectedColor];
      } else {
        // El color seleccionado NO tiene videos asignados
        console.log('NO hay videos para el color', selectedColor);
        return []; // Retornar array vacío en lugar de mostrar otros videos
      }
    }
    
    // Si no hay videosByColor pero hay videosWithColors, filtrar manualmente
    if (product.videosWithColors && product.videosWithColors.length > 0 && selectedColor) {
      // Filtrar videos que coincidan con el color seleccionado
      const colorVideos = product.videosWithColors
        .filter(vid => vid.color === selectedColor)
        .map(vid => vid.url);
      
      console.log('Videos filtrados por color:', colorVideos);
      
      if (colorVideos.length > 0) {
        console.log('Retornando videos específicos del color');
        return colorVideos;
      } else {
        // No hay videos para este color
        console.log('NO hay videos para el color', selectedColor);
        return [];
      }
    }
    
    // Si NO hay color seleccionado, usar videos generales
    console.log('Retornando videos generales');
    return product.videos || [];
  };
  
  const images = product ? getFilteredImages() : [];
  const videos = product ? getFilteredVideos() : [];
  
  // Crear array combinado de media (imágenes + videos)
  const mediaItems = [
    ...images.map(url => ({ type: 'image', url })),
    ...videos.map(url => ({ type: 'video', url }))
  ];

  const currentMedia = mediaItems[selectedMediaIndex];
  
  // Resetear índice de media cuando cambia el color
  useEffect(() => {
    setSelectedMediaIndex(0);
  }, [selectedColor]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientWelcomeBar />
        <ClientNavbar 
          wishlistCount={wishlistCount}
          cartCount={cartCount}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontSize: '14px',
              color: 'rgb(102, 102, 102)'
            }}>Cargando producto...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ClientWelcomeBar />
        <ClientNavbar 
          wishlistCount={wishlistCount}
          cartCount={cartCount}
        />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error || 'Producto no encontrado'}</p>
            <button
              onClick={() => navigate('/productos')}
              className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-black"
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientWelcomeBar />
      <ClientNavbar 
        wishlistCount={wishlistCount}
        cartCount={cartCount}
        onNavigateToWishlist={() => navigate('/wishlist')}
      />

      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-3" style={{ maxWidth: '1420px' }}>
          <div className="flex items-center gap-2 text-sm">
            <button 
              onClick={() => navigate('/productos')}
              className="text-gray-500 hover:text-gray-700"
              style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
            >
              Productos
            </button>
            <span className="text-gray-400">/</span>
            <span 
              className="text-gray-700"
              style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
            >
              {product.name}
            </span>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-8" style={{ maxWidth: '1420px' }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Columna izquierda: Galería de imágenes y videos */}
          <div>
            {/* Media principal con flechas de navegación */}
            <div className="bg-white rounded-lg overflow-hidden mb-4 border border-gray-200 relative group">
              {mediaItems.length === 0 ? (
                // Placeholder cuando no hay imágenes ni videos para el color seleccionado
                <div className="w-full flex items-center justify-center bg-gray-100" style={{ height: '600px' }}>
                  <div className="text-center px-6">
                    <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p style={{
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontSize: '16px',
                      color: 'rgb(102, 102, 102)',
                      marginBottom: '8px'
                    }}>
                      No hay imágenes disponibles
                    </p>
                    <p style={{
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontSize: '14px',
                      color: 'rgb(153, 153, 153)'
                    }}>
                      para el color {selectedColor}
                    </p>
                  </div>
                </div>
              ) : currentMedia?.type === 'image' ? (
                <img
                  src={currentMedia.url}
                  alt={product.name}
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '600px' }}
                />
              ) : (
                <video
                  src={currentMedia?.url}
                  controls
                  autoPlay
                  loop
                  muted
                  className="w-full h-auto object-cover"
                  style={{ maxHeight: '600px' }}
                />
              )}
              
              {/* Flecha izquierda */}
              {mediaItems.length > 1 && (
                <button
                  onClick={() => setSelectedMediaIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                  aria-label="Media anterior"
                >
                  <svg 
                    className="w-6 h-6 text-gray-900" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              )}
              
              {/* Flecha derecha */}
              {mediaItems.length > 1 && (
                <button
                  onClick={() => setSelectedMediaIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all z-10"
                  aria-label="Siguiente media"
                >
                  <svg 
                    className="w-6 h-6 text-gray-900" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              )}
              
              {/* Indicador de media actual */}
              {mediaItems.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {mediaItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedMediaIndex === index 
                          ? 'bg-white w-6' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                      aria-label={`Ir a media ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Miniaturas (imágenes y videos) */}
            {mediaItems.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {mediaItems.map((media, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`bg-white rounded-lg overflow-hidden border-2 transition-all relative ${
                      selectedMediaIndex === index ? 'border-gray-900' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {media.type === 'image' ? (
                      <img
                        src={media.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    ) : (
                      <>
                        <video
                          src={media.url}
                          className="w-full h-24 object-cover"
                        />
                        {/* Ícono de play para videos */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <svg 
                            className="w-8 h-8 text-white" 
                            fill="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna derecha: Información del producto */}
          <div>
            {/* Título */}
            <h1
              className="mb-4"
              style={{
                fontFamily: 'nantes, georgia, serif',
                fontWeight: 400,
                fontSize: '36px',
                lineHeight: '44px',
                color: 'rgb(33, 33, 33)'
              }}
            >
              {product.name}
            </h1>

            {/* SKU */}
            <p
              className="mb-6"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontSize: '14px',
                color: 'rgb(102, 102, 102)'
              }}
            >
              SKU: {product.sku}
            </p>

            {/* Precio */}
            <div className="mb-8">
              <p
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontWeight: 600,
                  fontSize: '32px',
                  lineHeight: '40px',
                  color: 'rgb(33, 33, 33)'
                }}
              >
                {formatPrice(product.price || product.reference_price)}
              </p>
              <p
                className="text-gray-500"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '14px'
                }}
              >
                Precio de referencia (mayorista)
              </p>
            </div>

            {/* Descripción */}
            <div className="mb-8 pb-8 border-b border-gray-200">
              <h3
                className="mb-3"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  color: 'rgb(33, 33, 33)'
                }}
              >
                Descripción
              </h3>
              <p
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '14px',
                  lineHeight: '22px',
                  color: 'rgb(71, 71, 71)'
                }}
              >
                {product.description || 'Sin descripción disponible'}
              </p>
            </div>

            {/* Selector de Color */}
            {product.available_colors && product.available_colors.length > 0 && (
              <div className="mb-6">
                <label
                  className="block mb-3"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'rgb(33, 33, 33)'
                  }}
                >
                  Color: <span className="font-normal text-gray-600">{selectedColor}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.available_colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 bg-gray-100'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontSize: '14px'
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Variantes de Color (Productos Relacionados) */}
            {product.color_variants && product.color_variants.length > 0 && (
              <div className="mb-6 pb-6 border-b border-gray-200">
                <label
                  className="block mb-3"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'rgb(33, 33, 33)'
                  }}
                >
                  Otros colores disponibles
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {product.color_variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => navigate(`/productos/${variant.id}`)}
                      className="group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-900 transition-all"
                    >
                      {/* Imagen del producto */}
                      {variant.image_url ? (
                        <div className="aspect-square bg-gray-100">
                          <img
                            src={variant.image_url}
                            alt={variant.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-square bg-gray-100 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      {/* Información del color */}
                      <div className="p-2 bg-white text-center">
                        <p
                          className="text-sm font-medium group-hover:text-gray-900"
                          style={{
                            fontFamily: 'graphik, helvetica, sans-serif',
                            fontSize: '13px',
                            color: 'rgb(71, 71, 71)'
                          }}
                        >
                          {variant.color}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de Talla */}
            {product.available_sizes && product.available_sizes.length > 0 && (
              <div className="mb-8">
                <label
                  className="block mb-3"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontWeight: 500,
                    fontSize: '14px',
                    color: 'rgb(33, 33, 33)'
                  }}
                >
                  Talla: <span className="font-normal text-gray-600">{selectedSize}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.available_sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? 'border-gray-900 bg-gray-100'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontSize: '14px'
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Selector de cantidad */}
            <div className="mb-8">
              <label
                className="block mb-3"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontWeight: 500,
                  fontSize: '14px',
                  color: 'rgb(33, 33, 33)'
                }}
              >
                Cantidad
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-900 transition-all flex items-center justify-center"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontSize: '20px'
                  }}
                >
                  −
                </button>
                <span
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontSize: '18px',
                    fontWeight: 500,
                    minWidth: '40px',
                    textAlign: 'center'
                  }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-900 transition-all flex items-center justify-center"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontSize: '20px'
                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="space-y-3 mb-6">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || !selectedColor || !selectedSize}
                className="w-full py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  backgroundColor: '#333333',
                  color: '#FFFFFF'
                }}
                onMouseEnter={(e) => !addingToCart && (e.target.style.backgroundColor = '#000000')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#333333')}
              >
                {addingToCart ? 'Agregando...' : 'Agregar al Carrito'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={addingToCart || !selectedColor || !selectedSize}
                className="w-full py-4 rounded-lg border-2 border-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-900 hover:text-white"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#333333'
                }}
              >
                Comprar Ahora
              </button>

              <button
                onClick={handleToggleWishlist}
                disabled={addingToWishlist}
                className="w-full py-4 rounded-lg border-2 border-gray-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:border-gray-900"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '16px',
                  fontWeight: 400
                }}
              >
                <svg 
                  className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`}
                  fill={isInWishlist ? 'currentColor' : 'none'}
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {isInWishlist ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
              </button>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-100 rounded-lg p-4 space-y-2">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px', color: 'rgb(71, 71, 71)' }}>
                  Producto disponible para compra al por mayor
                </p>
              </div>
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p style={{ fontFamily: 'graphik, helvetica, sans-serif', fontSize: '14px', color: 'rgb(71, 71, 71)' }}>
                  Envío disponible según ubicación
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

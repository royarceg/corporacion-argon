import React, { useState, useEffect } from 'react';
import productService from '../services/productService';

const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [productDetails, setProductDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadProductDetails = async () => {
      setLoading(true);
      try {
        // Cargar detalles completos del producto con variantes
        const response = await productService.getProductById(product.id);
        const details = response.product;
        setProductDetails(details);
        
        // Pre-seleccionar primer color y talla si existen
        if (details.available_colors && details.available_colors.length > 0) {
          setSelectedColor(details.available_colors[0]);
        }
        if (details.available_sizes && details.available_sizes.length > 0) {
          setSelectedSize(details.available_sizes[0]);
        }
      } catch (err) {
        console.error('Error al cargar detalles del producto:', err);
        // Si falla, usar los datos básicos
        setProductDetails(product);
      } finally {
        setLoading(false);
      }
    };

    if (product && isOpen) {
      // Limpiar estado anterior inmediatamente
      setProductDetails(null);
      setQuantity(1);
      loadProductDetails();
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  // Si está cargando o no hay detalles, mostrar loading
  if (loading || !productDetails) {
    return (
      <>
        {/* Overlay oscuro */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50"
          onClick={onClose}
        />

        {/* Modal centrado */}
        <div
          className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 overflow-hidden flex items-center justify-center"
          style={{ width: '500px', height: '630px' }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontSize: '14px',
              color: 'rgb(102, 102, 102)'
            }}>Cargando producto...</p>
          </div>
        </div>
      </>
    );
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleBuyNow = () => {
    const displayProduct = productDetails || product;
    onAddToCart({
      product_id: displayProduct.id,
      variant_id: null, // Aquí deberías buscar el variant_id correcto según color y talla
      quantity
    });
    onClose();
  };

  const displayProduct = productDetails || product;
  const total = displayProduct.price * quantity;

  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />

      {/* Modal centrado */}
      <div
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-2xl z-50 overflow-hidden"
        style={{ width: '500px', height: '630px' }}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-gray-100 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenido del modal */}
        <div className="h-full overflow-y-auto p-6">
          {/* Sección superior: Imagen + Info del producto - 414px x 192px */}
          <div className="mb-6" style={{ width: '414px', height: '192px' }}>
            <div className="flex gap-4">
              {/* Imagen del producto - 158px x 158px */}
              <div className="flex-shrink-0">
                <img
                  src={product.image_url || '/assets/images/Nuevo1.png'}
                  alt={product.name}
                  className="rounded-lg object-cover"
                  style={{ width: '158px', height: '158px' }}
                />
              </div>

              {/* Información a la derecha */}
              <div className="flex-1">
                {/* Nombre del producto */}
                <h2
                  className="mb-2"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 500,
                    color: 'rgb(51, 51, 51)',
                    fontSize: '20px',
                    lineHeight: '28px'
                  }}
                >
                  {displayProduct.name}
                </h2>

                {/* Descripción */}
                <p
                  className="mb-3"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 200,
                    color: 'rgb(102, 102, 102)',
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                >
                  {displayProduct.description || 'Producto de alta calidad'}
                </p>

                {/* Precio */}
                <p
                  className="mb-3"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 600,
                    color: 'rgb(0, 0, 0)',
                    fontSize: '24px',
                    lineHeight: '32px'
                  }}
                >
                  {formatPrice(displayProduct.price)}
                </p>

                {/* Ver más detalles */}
                <button
                  type="button"
                  className="inline-block underline bg-transparent border-none p-0 cursor-pointer"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 200,
                    color: 'rgb(51, 51, 51)',
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                >
                  Ver más detalles
                </button>
              </div>
            </div>
          </div>

          {/* Color */}
          {displayProduct.available_colors && displayProduct.available_colors.length > 0 && (
            <div className="mb-4">
              <label
                className="block mb-2"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 200,
                  color: 'rgb(51, 51, 51)',
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                Color
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '14px'
                }}
              >
                {displayProduct.available_colors.map((color) => (
                  <option key={color} value={color}>
                    {color}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Talla */}
          {displayProduct.available_sizes && displayProduct.available_sizes.length > 0 && (
            <div className="mb-4">
              <label
                className="block mb-2"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 200,
                  color: 'rgb(51, 51, 51)',
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                Size
              </label>
              <select
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '14px'
                }}
              >
                {displayProduct.available_sizes.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Cantidad */}
          <div className="mb-6">
            <label
              className="block mb-2"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 200,
                color: 'rgb(51, 51, 51)',
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              Cantidad
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-4 py-2 border border-gray-300 rounded-lg text-center"
                min="1"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* Botón Comprar ahora */}
          <button
            onClick={handleBuyNow}
            className="w-full py-4 rounded-lg transition-all"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight: 500,
              color: 'rgb(255, 255, 255)',
              fontSize: '16px',
              lineHeight: '24px',
              backgroundColor: '#000000'
            }}
          >
            Comprar ahora • {formatPrice(total)}
          </button>
        </div>
      </div>
    </>
  );
};

export default ProductModal;

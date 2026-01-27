import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ClientProductCard = ({ product, onAddToWishlist, onQuickAdd, isInWishlist }) => {
  const [showAddButton, setShowAddButton] = useState(false);
  const [wishlistActive, setWishlistActive] = useState(isInWishlist);
  const [isHovering, setIsHovering] = useState(false);
  const navigate = useNavigate();

  const handleWishlistClick = async (e) => {
    e.stopPropagation();
    const newState = !wishlistActive;
    setWishlistActive(newState);
    await onAddToWishlist(product.id, newState);
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    onQuickAdd(product);
  };

  const handleContextMenu = (e) => {
    // Permitir el click derecho nativo del navegador
    // No hacemos e.preventDefault(), permitiendo que el navegador abra el menú contextual
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  // Determinar qué imagen mostrar: segunda al hover, primera por defecto
  const currentImage = isHovering && product.images && product.images.length > 1
    ? product.images[1]
    : (product.image_url || '/assets/images/Nuevo1.png');

  return (
    <div 
      className="relative bg-white rounded-lg overflow-hidden group"
      onMouseEnter={() => {
        setShowAddButton(true);
        setIsHovering(true);
      }}
      onMouseLeave={() => {
        setShowAddButton(false);
        setIsHovering(false);
      }}
    >
      {/* Imagen del producto - clickeable y permite click derecho */}
      <div 
        className="relative overflow-hidden cursor-pointer"
        style={{ width: '246px', height: '200px' }}
        onClick={() => navigate(`/productos/${product.id}`)}
        onContextMenu={handleContextMenu}
      >
        <img
          src={currentImage}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Corazón - Esquina superior derecha */}
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
        >
          <svg
            className="w-5 h-5"
            fill={wishlistActive ? '#FF0000' : 'none'}
            stroke={wishlistActive ? '#FF0000' : '#000000'}
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>

        {/* Botón + - Esquina inferior derecha (aparece en hover) */}
        {showAddButton && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 bg-black rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
            style={{ width: '31px', height: '31px' }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="#FFFFFF"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Información del producto */}
      <div className="p-4">
        <h3
          className="mb-1 truncate cursor-pointer hover:text-gray-700 transition-colors"
          style={{
            fontFamily: 'graphik, helvetica, sans-serif',
            fontStyle: 'normal',
            fontWeight: 400,
            color: 'rgb(51, 51, 51)',
            fontSize: '16px',
            lineHeight: '24px'
          }}
          onClick={() => navigate(`/productos/${product.id}`)}
          onContextMenu={handleContextMenu}
        >
          {product.name}
        </h3>

        <p
          style={{
            fontFamily: 'graphik, helvetica, sans-serif',
            fontStyle: 'normal',
            fontWeight: 500,
            color: 'rgb(0, 0, 0)',
            fontSize: '18px',
            lineHeight: '26px'
          }}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </div>
  );
};

export default ClientProductCard;

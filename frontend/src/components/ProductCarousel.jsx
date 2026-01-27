import React from 'react';
import { Link } from 'react-router-dom';

const ProductCarousel = ({ title, products }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      {/* Título de la sección */}
      <h3
        className="mb-6"
        style={{
          fontFamily: 'graphik, helvetica, sans-serif',
          fontWeight: 600,
          fontSize: '24px',
          lineHeight: '32px',
          color: 'rgb(33, 33, 33)'
        }}
      >
        {title}
      </h3>

      {/* Grid de productos */}
      <div className="grid grid-cols-6 gap-4">
        {products.slice(0, 6).map((product) => (
          <Link
            key={product.id}
            to={`/productos/${product.id}`}
            className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow group block"
          >
            {/* Imagen */}
            <div className="relative overflow-hidden bg-gray-100" style={{ height: '160px' }}>
              <img
                src={product.image_url || product.images?.[0] || '/assets/images/Nuevo1.png'}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Información */}
            <div className="p-3">
              <h4
                className="mb-1 truncate"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontWeight: 400,
                  fontSize: '14px',
                  lineHeight: '20px',
                  color: 'rgb(51, 51, 51)'
                }}
              >
                {product.name}
              </h4>
              <p
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontWeight: 500,
                  fontSize: '16px',
                  lineHeight: '22px',
                  color: 'rgb(0, 0, 0)'
                }}
              >
                {formatPrice(product.price)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;

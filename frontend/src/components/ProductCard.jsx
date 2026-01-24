import React from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-gray-400">Sin imagen</span>
        )}
      </div>
      
      <div className="p-4">
        <div className="text-sm text-gray-500 mb-1">SKU: {product.sku}</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        )}
        
        <div className="flex gap-2 mb-3 text-sm">
          {product.size && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              Talla: {product.size}
            </span>
          )}
          {product.color && (
            <span className="bg-gray-100 px-2 py-1 rounded">
              Color: {product.color}
            </span>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            {product.reference_price ? (
              <div className="text-lg font-bold text-primary">
                ${parseFloat(product.reference_price).toFixed(2)}
                <span className="text-xs text-gray-500 block">Precio ref.</span>
              </div>
            ) : (
              <div className="text-sm text-gray-500">Sin precio de referencia</div>
            )}
          </div>
          
          <button
            onClick={() => onAddToCart(product)}
            className="bg-secondary text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          >
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

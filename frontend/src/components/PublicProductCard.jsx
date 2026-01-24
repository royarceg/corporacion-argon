import React from 'react';

const PublicProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="relative bg-neutral-lighter overflow-hidden flex items-center justify-center" style={{ height: '450px' }}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-neutral-lighter to-neutral-light">
            <div className="text-center">
              <svg className="w-20 h-20 mx-auto text-neutral-gray opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-neutral-gray text-sm mt-2">Imagen de producto</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-5">
        <div className="text-xs text-brand-green font-semibold mb-1">SKU: {product.sku}</div>
        <h3 className="text-lg font-bold text-brand-blue mb-2 line-clamp-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-sm text-neutral-gray mb-3 line-clamp-2">{product.description}</p>
        )}
        
        <div className="flex gap-2 mb-4">
          {product.size && (
            <span className="bg-neutral-lighter text-brand-blue px-3 py-1 rounded-full text-xs font-medium">
              {product.size}
            </span>
          )}
          {product.color && (
            <span className="bg-neutral-lighter text-brand-blue px-3 py-1 rounded-full text-xs font-medium">
              {product.color}
            </span>
          )}
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm text-neutral-gray italic">
            Inicia sesión para ver precios
          </p>
        </div>
      </div>
    </div>
  );
};

export default PublicProductCard;

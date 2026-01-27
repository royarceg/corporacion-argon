import React, { useEffect } from 'react';

const Toast = ({ message, productName, productImage, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000); // Se cierra automáticamente después de 3 segundos

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-24 right-6 z-50 animate-slideIn">
      <div 
        className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
        style={{ width: '360px' }}
      >
        <div className="flex items-center gap-4 p-4">
          {/* Imagen del producto */}
          {productImage && (
            <div className="flex-shrink-0">
              <img
                src={productImage}
                alt={productName}
                className="w-16 h-16 object-cover rounded-md"
              />
            </div>
          )}

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            {/* Ícono de check y mensaje */}
            <div className="flex items-center gap-2 mb-1">
              <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg 
                  className="w-3 h-3 text-white" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p 
                className="font-medium text-gray-900"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '14px'
                }}
              >
                {message}
              </p>
            </div>
            
            {/* Nombre del producto */}
            {productName && (
              <p 
                className="text-gray-600 truncate"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontSize: '13px'
                }}
              >
                {productName}
              </p>
            )}
          </div>

          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Barra de progreso */}
        <div className="h-1 bg-gray-100 overflow-hidden">
          <div 
            className="h-full bg-green-500 animate-progress"
            style={{ animationDuration: '3000ms' }}
          />
        </div>
      </div>
    </div>
  );
};

export default Toast;

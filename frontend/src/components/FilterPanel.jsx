import React, { useState, useEffect } from 'react';

const FilterPanel = ({ products, onFilterChange }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });

  // Extraer categorías únicas de los productos
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
  
  // Extraer colores únicos
  const colors = [...new Set(products.flatMap(p => p.colors || []).filter(Boolean))].sort();
  
  // Extraer tallas únicas
  const sizes = [...new Set(products.flatMap(p => p.sizes || []).filter(Boolean))].sort();

  // Calcular precio mínimo y máximo de los productos
  const minPrice = Math.min(...products.map(p => p.price || 0));
  const maxPrice = Math.max(...products.map(p => p.price || 0));

  useEffect(() => {
    // Inicializar rango de precios basado en productos
    setPriceRange({ min: minPrice, max: maxPrice });
  }, [minPrice, maxPrice]);

  // Aplicar filtros cuando cambien las selecciones
  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, selectedColors, selectedSizes, priceRange]);

  const applyFilters = () => {
    let filtered = [...products];

    // Filtro por categoría
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(p => selectedCategories.includes(p.category));
    }

    // Filtro por color
    if (selectedColors.length > 0) {
      filtered = filtered.filter(p => 
        p.colors && p.colors.some(color => selectedColors.includes(color))
      );
    }

    // Filtro por talla
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(p => 
        p.sizes && p.sizes.some(size => selectedSizes.includes(size))
      );
    }

    // Filtro por precio
    filtered = filtered.filter(p => 
      p.price >= priceRange.min && p.price <= priceRange.max
    );

    onFilterChange(filtered);
  };

  const toggleCategory = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleColor = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({
      ...prev,
      [type]: parseInt(value) || 0
    }));
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setSelectedSizes([]);
    setPriceRange({ min: minPrice, max: maxPrice });
  };

  const hasActiveFilters = selectedCategories.length > 0 || 
                          selectedColors.length > 0 || 
                          selectedSizes.length > 0 || 
                          priceRange.min !== minPrice || 
                          priceRange.max !== maxPrice;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="w-64 bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          style={{
            fontFamily: 'graphik, helvetica, sans-serif',
            fontWeight: 600,
            fontSize: '18px',
            color: 'rgb(33, 33, 33)'
          }}
        >
          Filtros
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontSize: '13px'
            }}
          >
            Limpiar
          </button>
        )}
      </div>

      {/* Filtro por Categoría */}
      {categories.length > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4
            className="mb-3"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: 'rgb(33, 33, 33)'
            }}
          >
            Categoría
          </h4>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => toggleCategory(category)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(71, 71, 71)'
                  }}
                >
                  {category}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por Precio */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <h4
          className="mb-3"
          style={{
            fontFamily: 'graphik, helvetica, sans-serif',
            fontWeight: 500,
            fontSize: '14px',
            color: 'rgb(33, 33, 33)'
          }}
        >
          Rango de Precio
        </h4>
        <div className="space-y-3">
          <div>
            <label
              className="block mb-1 text-xs text-gray-600"
              style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
            >
              Mínimo
            </label>
            <input
              type="number"
              value={priceRange.min}
              onChange={(e) => handlePriceChange('min', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
              min={minPrice}
              max={priceRange.max}
            />
          </div>
          <div>
            <label
              className="block mb-1 text-xs text-gray-600"
              style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
            >
              Máximo
            </label>
            <input
              type="number"
              value={priceRange.max}
              onChange={(e) => handlePriceChange('max', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
              min={priceRange.min}
              max={maxPrice}
            />
          </div>
          <p
            className="text-xs text-gray-500"
            style={{ fontFamily: 'graphik, helvetica, sans-serif' }}
          >
            {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
          </p>
        </div>
      </div>

      {/* Filtro por Color */}
      {colors.length > 0 && (
        <div className="mb-6 pb-6 border-b border-gray-200">
          <h4
            className="mb-3"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: 'rgb(33, 33, 33)'
            }}
          >
            Color
          </h4>
          <div className="space-y-2">
            {colors.map((color) => (
              <label
                key={color}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => toggleColor(color)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(71, 71, 71)'
                  }}
                >
                  {color}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Filtro por Talla */}
      {sizes.length > 0 && (
        <div>
          <h4
            className="mb-3"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontWeight: 500,
              fontSize: '14px',
              color: 'rgb(33, 33, 33)'
            }}
          >
            Talla
          </h4>
          <div className="space-y-2">
            {sizes.map((size) => (
              <label
                key={size}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontSize: '14px',
                    color: 'rgb(71, 71, 71)'
                  }}
                >
                  {size}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

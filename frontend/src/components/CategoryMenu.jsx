import React from 'react';

const CategoryMenu = ({ selectedCategory, onCategoryChange }) => {
  const categories = [
    'Todos',
    'Uniformes',
    'Camisas',
    'Pantalones',
    'Chalecos',
    'Accesorios',
    'Materia Prima',
    'Drones'
  ];

  return (
    <div className="bg-white border-b border-gray-200 py-6">
      <div className="mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
        <div className="flex items-center gap-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className="transition-all pb-2"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 200,
                color: selectedCategory === category ? 'rgb(0, 0, 0)' : 'rgb(51, 51, 51)',
                fontSize: '14px',
                lineHeight: '20px',
                borderBottom: selectedCategory === category ? '2px solid #000000' : '2px solid transparent'
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryMenu;

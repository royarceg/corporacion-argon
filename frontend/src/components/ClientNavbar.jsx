import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ClientNavbar = ({ wishlistCount = 0, cartCount = 0, onNavigateToWishlist, onCategorySelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [accountButtonRect, setAccountButtonRect] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const accountButtonRef = React.useRef(null);
  const accountCloseTimeoutRef = React.useRef(null);

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

  React.useEffect(() => {
    return () => {
      if (accountCloseTimeoutRef.current) {
        clearTimeout(accountCloseTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onCategorySelect) {
        onCategorySelect('search', searchQuery);
      }
    }
  };

  const handleCategoryClick = (category) => {
    setShowCategories(false);
    if (onCategorySelect) {
      onCategorySelect(category);
    }
  };

  const handleAccountMouseEnter = () => {
    if (accountCloseTimeoutRef.current) {
      clearTimeout(accountCloseTimeoutRef.current);
      accountCloseTimeoutRef.current = null;
    }
    
    if (accountButtonRef.current) {
      const rect = accountButtonRef.current.getBoundingClientRect();
      setAccountButtonRect(rect);
    }
    setShowAccountMenu(true);
  };

  const handleAccountMouseLeave = () => {
    accountCloseTimeoutRef.current = setTimeout(() => {
      setShowAccountMenu(false);
    }, 200);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200" style={{ height: '105px' }}>
      <div className="h-full flex items-center gap-4 mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
        {/* Logo - clickeable a home */}
        <Link to="/" className="flex-shrink-0">
          <img 
            src="/assets/images/Logo4.png" 
            alt="Corporación Argom" 
            style={{ height: '50px', cursor: 'pointer' }}
          />
        </Link>

        {/* Botón Todas las categorías con dropdown mejorado */}
        <div className="relative">
          <button
            onMouseEnter={() => setShowCategories(true)}
            onClick={() => setShowCategories(!showCategories)}
            className="flex items-center gap-2 transition-all whitespace-nowrap px-4 py-2 rounded-lg hover:bg-gray-50"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight: 400,
              color: 'rgb(0, 0, 0)',
              fontSize: '14px',
              lineHeight: '20px',
              backgroundColor: 'transparent',
              border: '1px solid #D1D5DB'
            }}
          >
            Todas las categorías
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu mejorado */}
          {showCategories && (
            <div 
              className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[220px] z-50"
              onMouseEnter={() => setShowCategories(true)}
              onMouseLeave={() => setShowCategories(false)}
            >
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryClick(category)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    color: 'rgb(51, 51, 51)',
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Barra de búsqueda funcional - 750px x 40px */}
        <form onSubmit={handleSearch}>
          <div className="relative" style={{ width: '750px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos o marcas al por mayor"
              className="w-full px-4 border rounded-full focus:ring-2 focus:ring-brand-green focus:border-gray-400 transition-all"
              style={{ 
                borderColor: '#D1D5DB',
                height: '40px',
                fontFamily: 'graphik, helvetica, sans-serif',
                fontSize: '14px'
              }}
            />
            <button
              type="submit"
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-black hover:text-brand-green transition-colors"
            >
              <svg 
                className="w-5 h-5"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Lado derecho: Lista de Deseos + Iconos */}
        <div className="flex items-center gap-6">
          {/* Lista de Deseos */}
          <Link
            to="/wishlist"
            className="hover:text-brand-green transition-colors whitespace-nowrap relative"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight: 200,
              color: 'rgb(51, 51, 51)',
              fontSize: '14px',
              lineHeight: '20px'
            }}
          >
            Lista de Deseos
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Icono Cuenta con Dropdown */}
          <div className="relative">
            <button 
              ref={accountButtonRef}
              onMouseEnter={handleAccountMouseEnter}
              onMouseLeave={handleAccountMouseLeave}
              className="hover:text-brand-green transition-colors"
            >
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </button>

            {/* Dropdown menu de cuenta */}
            {showAccountMenu && accountButtonRect && (
              <div 
                className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[180px]"
                style={{ 
                  zIndex: 9999,
                  top: `${accountButtonRect.bottom + 4}px`,
                  left: `${accountButtonRect.left - 140}px` // Ajustado para alinearse a la derecha del ícono
                }}
                onMouseEnter={handleAccountMouseEnter}
                onMouseLeave={handleAccountMouseLeave}
              >
                <Link
                  to="/ordenes"
                  className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    color: 'rgb(51, 51, 51)',
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                  onClick={() => setShowAccountMenu(false)}
                >
                  Mis Órdenes
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors"
                  style={{
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    color: 'rgb(51, 51, 51)',
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>

          {/* Icono Carrito */}
          <Link to="/cart" className="hover:text-brand-green transition-colors relative">
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default ClientNavbar;

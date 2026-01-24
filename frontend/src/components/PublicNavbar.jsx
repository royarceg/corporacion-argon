import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicNavbar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguage] = useState('ES');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);
  const [categoryButtonRect, setCategoryButtonRect] = useState(null);
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const categoryButtonRef = React.useRef(null);
  const closeTimeoutRef = React.useRef(null);

  // Limpiar timeout al desmontar
  React.useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  const categories = [
    { name: 'Destacado', href: '#destacado' },
    { name: 'Nuevo', href: '#nuevo' },
    { name: 'Uniformes', href: '#uniformes' },
    { name: 'Camisas', href: '#camisas' },
    { name: 'Pantalones', href: '#pantalones' },
    { name: 'Chalecos', href: '#chalecos' },
    { name: 'Accesorios', href: '#accesorios' },
    { name: 'Materia Prima', href: '#materia-prima' },
    { name: 'Drones', href: '#drones' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Aquí puedes agregar la lógica de búsqueda
      navigate(`/productos?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryMouseEnter = () => {
    // Cancelar cualquier cierre pendiente
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    
    if (categoryButtonRef.current) {
      const rect = categoryButtonRef.current.getBoundingClientRect();
      setCategoryButtonRect(rect);
    }
    setShowCategoriesMenu(true);
  };

  const handleCategoryMouseLeave = () => {
    // Agregar un pequeño delay antes de cerrar
    closeTimeoutRef.current = setTimeout(() => {
      setShowCategoriesMenu(false);
    }, 200); // 200ms de delay
  };

  const selectLanguage = (lang) => {
    setLanguage(lang);
    setShowLanguageMenu(false);
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0" style={{ zIndex: 1000, isolation: 'isolate' }}>
      {/* Main Navbar */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto py-4" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          <div className="flex items-center">
            {/* Logo - clickeable - redirige según autenticación */}
            <Link to={isAuthenticated() ? "/productos" : "/"} className="flex-shrink-0">
              <img 
                src="/assets/images/Logo4.png" 
                alt="Corporación Argom" 
                style={{ height: '50px', cursor: 'pointer' }}
              />
            </Link>

            {/* Search Bar - 750px × 37px */}
            <form onSubmit={handleSearch}>
              <div className="relative" style={{ width: '750px', marginLeft: '24px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos o marcas al por mayor"
                  className="w-full px-4 border rounded-full focus:ring-2 focus:ring-brand-green focus:border-gray-400 transition-all text-sm"
                  style={{ 
                    borderColor: '#D1D5DB',
                    height: '37px'
                  }}
                />
                {/* Icono de lupa a la derecha */}
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

            {/* Right side - sin gap automático */}
            <div className="flex items-center" style={{ marginLeft: '26px' }}>
              {/* Language Selector con dropdown */}
              <div className="relative">
                <button 
                  onMouseEnter={() => setShowLanguageMenu(true)}
                  onMouseLeave={() => setShowLanguageMenu(false)}
                  className="flex items-center gap-2 hover:text-brand-green transition-colors"
                  style={{ color: '#000000' }}
                >
                  <svg 
                    className="w-4 h-4" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                  >
                    <path d="M.857 12a11.143 11.143 0 1 0 22.286 0A11.143 11.143 0 0 0 .857 12ZM.857 12h22.286" />
                    <path d="M16.285 12A19.24 19.24 0 0 1 12 23.143 19.24 19.24 0 0 1 7.714 12 19.24 19.24 0 0 1 12 .857 19.24 19.24 0 0 1 16.285 12Z" />
                  </svg>
                  <p style={{ 
                    fontFamily: 'graphik, helvetica, sans-serif',
                    fontStyle: 'normal',
                    fontWeight: 200,
                    color: 'rgb(51, 51, 51)',
                    fontSize: '14px',
                    lineHeight: '20px'
                  }}>{language}</p>
                </button>

                {/* Dropdown menu */}
                {showLanguageMenu && (
                  <div 
                    className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-[100px] z-50"
                    onMouseEnter={() => setShowLanguageMenu(true)}
                    onMouseLeave={() => setShowLanguageMenu(false)}
                  >
                    <button
                      onClick={() => selectLanguage('ES')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      style={{ 
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 200,
                        color: 'rgb(51, 51, 51)',
                        fontSize: '14px',
                        lineHeight: '20px'
                      }}
                    >
                      Español
                    </button>
                    <button
                      onClick={() => selectLanguage('EN')}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100"
                      style={{ 
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 200,
                        color: 'rgb(51, 51, 51)',
                        fontSize: '14px',
                        lineHeight: '20px'
                      }}
                    >
                      English
                    </button>
                  </div>
                )}
              </div>

              {/* Blog Link - REMOVIDO */}
              {/* <a 
                href="#blog" 
                className="hover:text-brand-green transition-colors whitespace-nowrap"
                style={{ 
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 200,
                  color: 'rgb(51, 51, 51)',
                  fontSize: '14px',
                  lineHeight: '20px',
                  marginLeft: '24px' 
                }}
              >
                Blog
              </a> */}

              {/* Mostrar según si el usuario está autenticado */}
              {isAuthenticated() ? (
                <>
                  {/* Nombre del usuario - centrado verticalmente */}
                  <div className="flex items-center" style={{ marginLeft: '24px' }}>
                    <span
                      className="whitespace-nowrap"
                      style={{ 
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(51, 51, 51)',
                        fontSize: '14px',
                        lineHeight: '20px'
                      }}
                    >
                      Bienvenido {user?.name || user?.user_name}
                    </span>
                  </div>

                  {/* Botón Ir a Catálogo */}
                  <Link
                    to="/productos"
                    className="px-6 rounded-lg transition-all whitespace-nowrap"
                    style={{ 
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 200,
                      color: '#FAFAFA',
                      fontSize: '14px',
                      lineHeight: '20px',
                      backgroundColor: '#333333',
                      height: '39px',
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '24px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#000000'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#333333'}
                  >
                    Ir a Catálogo
                  </Link>
                </>
              ) : (
                <>
                  {/* Iniciar sesión - texto plano */}
                  <Link 
                    to="/login" 
                    className="hover:text-brand-green transition-colors whitespace-nowrap"
                    style={{ 
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 200,
                      color: 'rgb(51, 51, 51)',
                      fontSize: '14px',
                      lineHeight: '20px',
                      marginLeft: '24px' 
                    }}
                  >
                    Iniciar sesión
                  </Link>

                  {/* Registrarse - botón gris oscuro, negro en hover */}
                  <Link 
                    to="/login" 
                    className="px-6 rounded-lg transition-all whitespace-nowrap"
                    style={{ 
                      fontFamily: 'graphik, helvetica, sans-serif',
                      fontStyle: 'normal',
                      fontWeight: 200,
                      color: '#FAFAFA',
                      fontSize: '14px',
                      lineHeight: '20px',
                      backgroundColor: '#333333',
                      height: '39px',
                      display: 'flex',
                      alignItems: 'center',
                      marginLeft: '24px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#000000'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#333333'}
                  >
                    Registrarse para comprar
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Categories Menu */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto" style={{ maxWidth: '1420px', paddingLeft: '25px', paddingRight: '25px' }}>
          <div className="flex items-center justify-center gap-8 overflow-x-auto py-3">
            {/* Todas las categorías con dropdown */}
            <div className="relative">
              <button
                ref={categoryButtonRef}
                onMouseEnter={handleCategoryMouseEnter}
                onMouseLeave={handleCategoryMouseLeave}
                className="hover:text-brand-green transition-colors whitespace-nowrap py-2 border-b-2 border-transparent hover:border-brand-green flex items-center gap-1"
                style={{ 
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  color: 'rgb(51, 51, 51)',
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                Todas las categorías
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu de categorías - FIXED para escapar del contexto sticky */}
              {showCategoriesMenu && categoryButtonRect && (
                <div 
                  className="fixed bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-[220px]"
                  style={{ 
                    zIndex: 9999,
                    top: `${categoryButtonRect.bottom + 4}px`, // Reducido a 4px para cerrar el gap
                    left: `${categoryButtonRect.left}px`
                  }}
                  onMouseEnter={handleCategoryMouseEnter}
                  onMouseLeave={handleCategoryMouseLeave}
                >
                  {categories.map((category) => (
                    <a
                      key={category.name}
                      href={category.href}
                      className="block px-4 py-3 hover:bg-gray-100 transition-colors"
                      style={{ 
                        fontFamily: 'graphik, helvetica, sans-serif',
                        fontStyle: 'normal',
                        fontWeight: 400,
                        color: 'rgb(51, 51, 51)',
                        fontSize: '14px',
                        lineHeight: '20px'
                      }}
                      onClick={() => setShowCategoriesMenu(false)}
                    >
                      {category.name}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Resto de categorías individuales */}
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="hover:text-brand-green transition-colors whitespace-nowrap py-2 border-b-2 border-transparent hover:border-brand-green"
                style={{ 
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 400,
                  color: 'rgb(51, 51, 51)',
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
              >
                {category.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;

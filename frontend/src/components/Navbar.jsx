import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAdmin, isClient } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to={isAdmin() ? '/admin' : '/productos'} className="text-xl font-bold">
            Corporación Argom
          </Link>

          {/* Links de navegación */}
          <div className="flex items-center space-x-6">
            {isClient() && (
              <>
                <Link to="/productos" className="hover:text-secondary transition-colors">
                  Productos
                </Link>
                <Link to="/ordenes" className="hover:text-secondary transition-colors">
                  Mis Órdenes
                </Link>
              </>
            )}

            {isAdmin() && (
              <>
                <Link to="/admin" className="hover:text-secondary transition-colors">
                  Dashboard
                </Link>
                <Link to="/admin/ordenes" className="hover:text-secondary transition-colors">
                  Órdenes
                </Link>
                <Link to="/admin/usuarios" className="hover:text-secondary transition-colors">
                  Usuarios
                </Link>
              </>
            )}

            {/* Usuario y logout */}
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                {user?.user_name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-danger hover:bg-red-600 px-4 py-2 rounded transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

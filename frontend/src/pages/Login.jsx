import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(username, password);
      
      if (response.success) {
        login(response.user, response.token);
        
        // Redirigir según el rol
        if (response.user.role === 'master_admin') {
          navigate('/admin');
        } else {
          // Cliente va al catálogo de productos
          navigate('/productos');
        }
      }
    } catch (err) {
      setError(err.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}>
      {/* Ventana flotante blanca */}
      <div className="bg-white rounded-lg shadow-2xl p-12" style={{ width: '500px' }}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/assets/images/Logo4.png" 
            alt="Corporación Argom" 
            style={{ height: '60px' }}
          />
        </div>

        {/* Título */}
        <h2 
          className="text-center mb-8"
          style={{
            fontFamily: 'nantes, georgia, serif',
            fontStyle: 'normal',
            fontWeight: 400,
            color: 'rgb(51, 51, 51)',
            fontSize: '30px',
            lineHeight: '38px'
          }}
        >
          Inicia sesión en Argon
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Campo Usuario */}
          <div>
            <label 
              htmlFor="username" 
              className="block mb-2"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 200,
                color: 'rgb(51, 51, 51)',
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              Usuario completo
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 200,
                fontSize: '14px',
                lineHeight: '20px'
              }}
              placeholder="tu_usuario"
            />
          </div>

          {/* Campo Contraseña */}
          <div>
            <label 
              htmlFor="password" 
              className="block mb-2"
              style={{
                fontFamily: 'graphik, helvetica, sans-serif',
                fontStyle: 'normal',
                fontWeight: 200,
                color: 'rgb(51, 51, 51)',
                fontSize: '14px',
                lineHeight: '20px'
              }}
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                style={{
                  fontFamily: 'graphik, helvetica, sans-serif',
                  fontStyle: 'normal',
                  fontWeight: 200,
                  fontSize: '14px',
                  lineHeight: '20px'
                }}
                placeholder="••••••••"
              />
              {/* Botón de ojito */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Botón Siguiente */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'graphik, helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight: 200,
              color: 'rgb(255, 255, 255)',
              fontSize: '14px',
              lineHeight: '20px',
              backgroundColor: '#333333'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#000000';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#333333';
              }
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Siguiente'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

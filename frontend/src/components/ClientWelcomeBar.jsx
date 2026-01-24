import React from 'react';
import { useAuth } from '../context/AuthContext';

const ClientWelcomeBar = () => {
  const { user } = useAuth();

  // Obtener el nombre del usuario (puede ser name, full_name, o user_name como fallback)
  const userName = user?.name || user?.full_name || user?.user_name || 'Cliente';

  return (
    <div 
      className="w-full flex items-center justify-center"
      style={{ 
        backgroundColor: '#F8F1E9',
        height: '44px'
      }}
    >
      <div className="flex items-center justify-center gap-2" style={{ width: '100%' }}>
        {/* Ícono decorativo (letra A) */}
        <div 
          className="flex items-center justify-center rounded-full"
          style={{
            width: '24px',
            height: '24px',
            backgroundColor: 'rgb(51, 51, 51)',
            color: '#F8F1E9',
            fontFamily: 'nantes, georgia, serif',
            fontWeight: 700,
            fontSize: '14px'
          }}
        >
          A
        </div>

        {/* Texto de bienvenida */}
        <p
          style={{
            fontFamily: 'graphik, helvetica, sans-serif',
            fontStyle: 'normal',
            fontWeight: 200,
            color: 'rgb(51, 51, 51)',
            fontSize: '14px',
            lineHeight: '20px'
          }}
        >
          Bienvenido {userName}
        </p>
      </div>
    </div>
  );
};

export default ClientWelcomeBar;

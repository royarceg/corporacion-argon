import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Componente que maneja TODO el comportamiento de scroll:
 * - Scroll al inicio en navegaciones hacia adelante
 * - Restaura posición en navegaciones hacia atrás
 */
const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef({});

  useEffect(() => {
    const currentPath = location.pathname;

    if (navigationType === 'POP') {
      // Navegación hacia atrás: restaurar posición guardada
      const savedPosition = scrollPositions.current[currentPath];
      if (savedPosition !== undefined) {
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }
    } else {
      // Navegación hacia adelante: ir al inicio
      window.scrollTo(0, 0);
    }

    // Guardar posición actual antes de salir de esta página
    const positions = scrollPositions.current;
    return () => {
      positions[currentPath] = window.scrollY;
    };
  }, [location.pathname, navigationType]);

  return null;
};

export default ScrollRestoration;

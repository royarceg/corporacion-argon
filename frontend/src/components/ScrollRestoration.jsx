import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Componente que guarda y restaura la posición del scroll
 * cuando el usuario navega hacia atrás
 */
const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef({});

  useEffect(() => {
    const currentPath = location.pathname;

    // Si es una navegación hacia atrás (POP), restaurar la posición guardada
    if (navigationType === 'POP') {
      const savedPosition = scrollPositions.current[currentPath];
      if (savedPosition !== undefined) {
        // Usar requestAnimationFrame para asegurar que el DOM esté listo
        requestAnimationFrame(() => {
          window.scrollTo(0, savedPosition);
        });
      }
    } else {
      // Si es una navegación hacia adelante, guardar la posición actual antes de navegar
      // Copiar la referencia a una variable local para el cleanup
      const positions = scrollPositions.current;
      return () => {
        positions[currentPath] = window.scrollY;
      };
    }
  }, [location.pathname, navigationType]);

  return null;
};

export default ScrollRestoration;

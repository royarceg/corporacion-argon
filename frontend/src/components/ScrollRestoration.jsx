import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que guarda la posición de scroll por ruta.
 * La restauración se hace manualmente en cada página cuando el contenido está listo.
 */
const ScrollRestoration = () => {
  const location = useLocation();

  useEffect(() => {
    // Deshabilitar el comportamiento automático del navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    // Guardar posición en cada scroll
    const saveScrollPosition = () => {
      const scrollPos = {
        x: window.scrollX,
        y: window.scrollY,
      };
      sessionStorage.setItem(
        `scrollPos:${location.pathname}`,
        JSON.stringify(scrollPos)
      );
    };

    window.addEventListener('scroll', saveScrollPosition, { passive: true });

    return () => {
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, [location.pathname]);

  return null;
};

export default ScrollRestoration;

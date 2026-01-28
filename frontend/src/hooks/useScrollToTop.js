import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook que hace scroll al inicio de la página cuando cambia la ruta
 * Solo aplica en navegaciones hacia adelante (no en "back")
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Solo hacer scroll si es una navegación hacia adelante
    // El estado "scrollRestoration" indica si es un "back"
    if (location.state?.scrollRestoration !== true) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, location.state]);
};

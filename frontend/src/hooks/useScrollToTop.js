import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Hook que hace scroll al inicio de la página cuando cambia la ruta
 * Solo aplica en navegaciones hacia adelante (no en "back")
 */
export const useScrollToTop = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Solo hacer scroll al inicio si NO es una navegación hacia atrás (POP)
    // POP = usuario presionó botón atrás del navegador
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, navigationType]);
};

import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/**
 * Componente que maneja el scroll:
 * - Guarda posición constantemente en sessionStorage
 * - Restaura posición en navegaciones hacia atrás
 * - Scroll al inicio en navegaciones hacia adelante
 */
const ScrollRestoration = () => {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    const currentPath = location.pathname;

    if (navigationType === 'POP') {
      // Navegación hacia atrás: restaurar posición guardada
      const savedPosition = sessionStorage.getItem(`scroll_${currentPath}`);
      if (savedPosition) {
        const position = parseInt(savedPosition, 10);
        // Esperar un poco para que el DOM esté listo
        setTimeout(() => {
          window.scrollTo(0, position);
        }, 0);
      }
    } else {
      // Navegación hacia adelante: ir al inicio
      window.scrollTo(0, 0);
    }

    // Guardar posición del scroll cada vez que el usuario hace scroll
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_${currentPath}`, window.scrollY.toString());
    };

    // Agregar listener de scroll
    window.addEventListener('scroll', handleScroll);

    // Limpiar listener al desmontar
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname, navigationType]);

  return null;
};

export default ScrollRestoration;

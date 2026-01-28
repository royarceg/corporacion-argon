import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente que guarda la posición de scroll por ruta.
 * Tiene un periodo de "cooldown" después de cada navegación para evitar
 * guardar posiciones incorrectas durante la transición.
 */
const ScrollRestoration = () => {
  const location = useLocation();
  const canSave = useRef(false);

  useEffect(() => {
    // Deshabilitar el comportamiento automático del navegador
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Cuando cambia la ruta, desactivamos el guardado temporalmente
    canSave.current = false;

    // Después de 1 segundo, permitimos guardar de nuevo
    // Esto da tiempo a que la página cargue y restaure el scroll
    const timer = setTimeout(() => {
      canSave.current = true;
    }, 1000);

    const saveScrollPosition = () => {
      // Solo guardar si pasó el periodo de cooldown
      if (!canSave.current) return;

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
      clearTimeout(timer);
      window.removeEventListener('scroll', saveScrollPosition);
    };
  }, [location.pathname]);

  return null;
};

export default ScrollRestoration;

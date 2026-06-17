import { useEffect, useState } from "react";
import { productService, ApiProduct } from "@/services/productService";

/**
 * Carga los productos según el rol del usuario.
 * Garantiza que `fetching` termine en `false` en TODOS los caminos
 * (incluido el de usuario no autenticado), para no quedar atascado en "Cargando".
 */
export function useProductsData(
  loading: boolean,
  isAuthenticated: () => boolean,
  isAdmin: () => boolean
) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (loading) return; // la auth todavía está resolviendo

    if (!isAuthenticated()) {
      // No autenticado: no hay nada que cargar (el guard useRequireAuth redirige).
      // Igual liberamos el estado de carga para no quedar atascado en "Cargando".
      setFetching(false);
      return;
    }

    const request = isAdmin() ? productService.getAllAdmin() : productService.getProducts();
    request
      .then(setProducts)
      .catch(console.error)
      .finally(() => setFetching(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, isAuthenticated]);

  return { products, fetching };
}

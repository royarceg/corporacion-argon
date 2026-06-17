import { renderHook } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import type { ReactNode } from "react";

// Las funciones de auth se usan en dependency arrays de otros efectos
// (CartContext/WishlistContext). Si cambian de identidad en cada render,
// disparan re-fetches innecesarios. Deben estar memoizadas.
function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe("AuthContext — funciones memoizadas", () => {
  test("isAuthenticated mantiene la misma identidad entre renders", () => {
    const { result, rerender } = renderHook(() => useAuth(), { wrapper });
    const first = result.current.isAuthenticated;
    rerender();
    const second = result.current.isAuthenticated;
    expect(second).toBe(first);
  });

  test("isAdmin e isClient también son estables entre renders", () => {
    const { result, rerender } = renderHook(() => useAuth(), { wrapper });
    const firstAdmin = result.current.isAdmin;
    const firstClient = result.current.isClient;
    rerender();
    expect(result.current.isAdmin).toBe(firstAdmin);
    expect(result.current.isClient).toBe(firstClient);
  });
});

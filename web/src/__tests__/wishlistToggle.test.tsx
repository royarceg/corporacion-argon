import { renderHook, act } from "@testing-library/react";
import type { ReactNode } from "react";
import { WishlistProvider, useWishlist } from "../context/WishlistContext";
import { wishlistService } from "../services/wishlistService";

jest.mock("../services/wishlistService", () => ({
  wishlistService: {
    getWishlist: jest.fn().mockResolvedValue([]),
    add: jest.fn(),
    remove: jest.fn(),
  },
}));

jest.mock("../context/AuthContext", () => {
  // Referencias estables (igual que el AuthContext real memoizado) para no
  // disparar el loop del useEffect de refresh.
  const isAuthenticated = () => true;
  const isClient = () => true;
  return { useAuth: () => ({ isAuthenticated, isClient }) };
});

function wrapper({ children }: { children: ReactNode }) {
  return <WishlistProvider>{children}</WishlistProvider>;
}

describe("WishlistContext.toggle — sin fallos silenciosos", () => {
  beforeEach(() => jest.clearAllMocks());

  test("si el servicio falla, NO lanza y revierte el estado (el producto no queda marcado)", async () => {
    (wishlistService.add as jest.Mock).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {}); // dejar asentar el refresh inicial

    // No debe lanzar (antes el await tiraba el error sin manejarlo)
    await act(async () => {
      await result.current.toggle(5);
    });

    expect(result.current.isWishlisted(5)).toBe(false);
  });

  test("si el servicio responde ok, marca el producto", async () => {
    (wishlistService.add as jest.Mock).mockResolvedValue({});
    const { result } = renderHook(() => useWishlist(), { wrapper });
    await act(async () => {}); // dejar asentar el refresh inicial

    await act(async () => {
      await result.current.toggle(7);
    });

    expect(result.current.isWishlisted(7)).toBe(true);
    expect(wishlistService.add).toHaveBeenCalledWith(7);
  });
});

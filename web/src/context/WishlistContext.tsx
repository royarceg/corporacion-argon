"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { wishlistService } from "@/services/wishlistService";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistedIds: Set<number>;
  count: number;
  toggle: (product_id: number) => Promise<void>;
  isWishlisted: (product_id: number) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isClient } = useAuth();
  const [wishlistedIds, setWishlistedIds] = useState<Set<number>>(new Set());

  const refresh = useCallback(async () => {
    if (!isAuthenticated() || !isClient()) return;
    try {
      const items = await wishlistService.getWishlist();
      setWishlistedIds(new Set(items.map((i) => i.product_id)));
    } catch {
      // Not authenticated or error — ignore
    }
  }, [isAuthenticated, isClient]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = useCallback(async (product_id: number) => {
    const wasWishlisted = wishlistedIds.has(product_id);
    // Update optimista (UI instantánea)
    setWishlistedIds((prev) => {
      const next = new Set(prev);
      if (wasWishlisted) next.delete(product_id);
      else next.add(product_id);
      return next;
    });
    try {
      if (wasWishlisted) await wishlistService.remove(product_id);
      else await wishlistService.add(product_id);
    } catch (e) {
      // Si el servicio falla, revertimos el cambio optimista (no falla en silencio)
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        if (wasWishlisted) next.add(product_id);
        else next.delete(product_id);
        return next;
      });
      console.error("No se pudo actualizar la wishlist:", e);
    }
  }, [wishlistedIds]);

  const isWishlisted = useCallback(
    (product_id: number) => wishlistedIds.has(product_id),
    [wishlistedIds]
  );

  const value = useMemo(
    () => ({ wishlistedIds, count: wishlistedIds.size, toggle, isWishlisted, refresh }),
    [wishlistedIds, toggle, isWishlisted, refresh]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}

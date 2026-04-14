"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
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

  async function toggle(product_id: number) {
    if (wishlistedIds.has(product_id)) {
      await wishlistService.remove(product_id);
      setWishlistedIds((prev) => {
        const next = new Set(prev);
        next.delete(product_id);
        return next;
      });
    } else {
      await wishlistService.add(product_id);
      setWishlistedIds((prev) => new Set([...prev, product_id]));
    }
  }

  const isWishlisted = (product_id: number) => wishlistedIds.has(product_id);

  return (
    <WishlistContext.Provider value={{
      wishlistedIds,
      count: wishlistedIds.size,
      toggle,
      isWishlisted,
      refresh,
    }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used inside WishlistProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { cartService, CartItem } from "@/services/cartService";
import { useAuth } from "./AuthContext";

interface CartContextType {
  items: CartItem[];
  count: number;
  total: string;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (product_id: number, quantity?: number, variant_id?: number, note?: string) => Promise<void>;
  updateItem: (cart_item_id: number, quantity: number) => Promise<void>;
  removeItem: (cart_item_id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isClient } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState("0");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated() || !isClient()) return;
    try {
      const cart = await cartService.getCart();
      setItems(cart.items ?? []);
      setTotal(cart.total ?? "0");
      setCount(cart.items?.reduce((sum, i) => sum + i.quantity, 0) ?? 0);
    } catch {
      // Not logged in or no cart yet
    }
  }, [isAuthenticated, isClient]);

  useEffect(() => { refresh(); }, [refresh]);

  async function addToCart(product_id: number, quantity = 1, variant_id?: number, note?: string) {
    await cartService.addToCart(product_id, quantity, variant_id, note);
    await refresh();
    setDrawerOpen(true);
    // Nota: si cartService.addToCart lanza, el error se propaga al llamador
  }

  async function updateItem(cart_item_id: number, quantity: number) {
    await cartService.updateItem(cart_item_id, quantity);
    await refresh();
  }

  async function removeItem(cart_item_id: number) {
    await cartService.removeItem(cart_item_id);
    await refresh();
  }

  async function clearCart() {
    await cartService.clearCart();
    setItems([]);
    setCount(0);
    setTotal("0");
  }

  return (
    <CartContext.Provider value={{
      items, count, total, drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addToCart, updateItem, removeItem, clearCart, refresh,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

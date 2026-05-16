"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const clientTabs = [
  { key: "home", label: "Inicio", href: "/", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 9.5L12 3l9 6.5V21H3z"/></svg>
  )},
  { key: "catalog", label: "Catálogo", href: "/productos", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="9" x2="21" y2="9"/></svg>
  )},
  { key: "search", label: "Buscar", href: "search", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
  )},
  { key: "cart", label: "Carrito", href: "/carrito", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
  )},
  { key: "account", label: "Cuenta", href: "account", icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/></svg>
  )},
];

const adminTabs = [
  { key: "ordenes", label: "Órdenes", icon: "📦" },
  { key: "usuarios", label: "Usuarios", icon: "👥" },
  { key: "productos", label: "Productos", icon: "📋" },
  { key: "clientes", label: "Clientes", icon: "🏢" },
  { key: "variantes", label: "Variantes", icon: "🎨" },
];

export default function MobileBottomNav() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Solo el AdminPage en /admin maneja sus propios tabs internos (state setActiveTab)
  // El bottom nav admin se muestra a través de un evento custom o se omite cuando estamos en /admin
  const inAdmin = pathname?.startsWith("/admin") ?? false;

  function getActiveClient() {
    if (pathname === "/") return "home";
    if (pathname?.startsWith("/productos")) return "catalog";
    if (pathname?.startsWith("/carrito")) return "cart";
    if (pathname?.startsWith("/mi-cuenta") || pathname === "/login") return "account";
    return null;
  }

  function handleClientTab(href: string) {
    if (href === "search") {
      setSearchOpen(true);
      return;
    }
    if (href === "account") {
      router.push(isAuthenticated() ? (isAdmin() ? "/admin" : "/mi-cuenta") : "/login");
      return;
    }
    router.push(href);
  }

  function handleSearchSubmit(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchOpen(false);
      router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  }

  if (inAdmin) return null; // El AdminLayout maneja su propio bottom nav admin

  const activeClient = getActiveClient();

  return (
    <>
      <style>{`
        .mob-nav { display: none; }
        @media (max-width: 1023px) {
          .mob-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; height: 64px; background: #fff; border-top: 1px solid rgba(0,0,0,0.08); z-index: 50; padding-bottom: env(safe-area-inset-bottom); padding-left: env(safe-area-inset-left); padding-right: env(safe-area-inset-right); }
        }
        .mob-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-family: StyreneA, sans-serif; font-size: 10px; color: rgba(0,0,0,0.5); background: none; border: none; cursor: pointer; padding: 8px 4px; min-height: 44px; position: relative; }
        .mob-tab.active { color: #000; font-weight: 500; }
        .mob-tab svg { width: 22px; height: 22px; }
        .mob-tab-badge { position: absolute; top: 4px; right: calc(50% - 18px); background: #000; color: #fff; font-size: 9px; min-width: 16px; height: 16px; border-radius: 8px; display: flex; align-items: center; justify-content: center; padding: 0 4px; font-weight: 500; }
        /* Push body content up so bottom nav doesn't cover it */
        @media (max-width: 1023px) {
          .mob-nav-spacer { height: calc(64px + env(safe-area-inset-bottom)); flex-shrink: 0; }
        }
        @media (min-width: 1024px) {
          .mob-nav-spacer { display: none; }
        }
        /* Search overlay */
        .mob-search-overlay { position: fixed; inset: 0; background: rgba(18,18,18,0.4); z-index: 90; }
        .mob-search-panel { position: fixed; top: 0; left: 0; right: 0; background: #fff; z-index: 100; padding: 16px; display: flex; align-items: center; gap: 12px; padding-top: max(16px, env(safe-area-inset-top)); }
        .mob-search-panel input { flex: 1; min-width: 0; border: 1px solid rgba(0,0,0,0.15); padding: 10px 14px; font-family: StyreneA, sans-serif; font-size: 16px; outline: none; }
        .mob-search-close { background: none; border: none; padding: 8px; cursor: pointer; }
      `}</style>

      <nav className="mob-nav" aria-label="Navegación principal">
        {clientTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleClientTab(tab.href)}
            className={`mob-tab${activeClient === tab.key ? " active" : ""}`}
            aria-label={tab.label}
          >
            {tab.icon}
            {tab.label}
            {tab.key === "cart" && count > 0 && <span className="mob-tab-badge">{count}</span>}
          </button>
        ))}
      </nav>

      {searchOpen && (
        <>
          <div className="mob-search-overlay" onClick={() => setSearchOpen(false)} />
          <div className="mob-search-panel">
            <input
              autoFocus
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchSubmit}
            />
            <button onClick={() => setSearchOpen(false)} aria-label="Cerrar" className="mob-search-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
            </button>
          </div>
        </>
      )}
    </>
  );
}

// Spacer component to add padding-bottom so bottom nav doesn't cover content
export function MobileBottomNavSpacer() {
  return <div className="mob-nav-spacer" aria-hidden="true" />;
}

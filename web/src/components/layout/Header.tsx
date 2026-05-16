"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

const navLinks = [
  { label: "Tienda", href: "/productos", hasDropdown: true },
  { label: "Solicitar Producto", href: "/solicitar-producto" },
  { label: "Blog", href: "/blog" },
];

const dropdownColumns = [
  {
    title: "Categorías",
    links: [
      { label: "Uniformes", href: "/productos?cat=UNIFORME" },
      { label: "Zapatos de Seguridad", href: "/productos?cat=ZAPATOS+DE+SEGURIDAD" },
      { label: "Motocicleta", href: "/productos?cat=MOTOCICLETA" },
      { label: "Seguridad", href: "/productos?cat=SEGURIDAD" },
      { label: "Protección", href: "/productos?cat=PROTECCION" },
      { label: "Ver Todo", href: "/productos" },
    ],
  },
  {
    title: "Destacado",
    links: [
      { label: "Novedades", href: "/productos" },
      { label: "Más Vendidos", href: "/productos" },
      { label: "Promocionales", href: "/productos" },
    ],
  },
  {
    title: "Colecciones",
    links: [
      { label: "Chaleco Reflectivo", href: "/productos?q=chaleco+reflectivo" },
      { label: "Jacket", href: "/productos?q=jacket" },
      { label: "Capa Impermeable", href: "/productos?q=capa" },
      { label: "Camisa", href: "/productos?q=camisa" },
    ],
  },
];

export default function Header() {
  const { isAuthenticated, isAdmin } = useAuth();
  const { count, openDrawer: _openDrawer } = useCart();
  const { count: wishlistCount } = useWishlist();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  function openSearch() { setSearchOpen(true); setDropdownOpen(false); setMobileMenuOpen(false); }
  function closeSearch() { setSearchOpen(false); setSearchQuery(""); }
  function closeAll() { setSearchOpen(false); setDropdownOpen(false); setSearchQuery(""); setMobileMenuOpen(false); }

  function handleSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && searchQuery.trim()) {
      closeSearch();
      router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  // Lock body scroll when mobile menu open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <style>{`
        .header-wrapper { position: sticky; top: 0; width: 100%; max-width: 1400px; z-index: 50; background-color: #ffffff; margin-inline: auto; }
        .header-bar { width: 100%; height: 68px; display: flex; align-items: center; justify-content: space-between; padding: 0 clamp(16px, 4vw, 32px); }
        .header-left { display: flex; align-items: center; gap: clamp(16px, 3vw, 32px); }
        .header-logo { font-family: StyreneA, sans-serif; font-size: 20px; font-weight: 700; color: #000; text-decoration: none; letter-spacing: -0.02em; }
        .header-nav-desktop { display: none; }
        @media (min-width: 1024px) { .header-nav-desktop { display: flex; align-items: center; } }
        .header-nav-link { font-family: StyreneA, sans-serif; font-size: 13px; font-weight: 400; color: #000; text-decoration: none; padding: 0 16px; display: block; line-height: 68px; }
        .header-icons { display: flex; align-items: center; gap: clamp(12px, 2vw, 20px); }
        .header-icon-btn { background: none; border: none; cursor: pointer; padding: 6px; display: flex; align-items: center; min-width: 32px; min-height: 32px; justify-content: center; }
        .header-icon-link { display: flex; align-items: center; text-decoration: none; padding: 6px; min-width: 32px; min-height: 32px; justify-content: center; }
        .header-hamburger { display: inline-flex; }
        @media (min-width: 1024px) { .header-hamburger { display: none; } }
        .header-cart-count, .header-wishlist-count { font-family: StyreneA, sans-serif; font-size: 13px; font-weight: 400; color: #000; margin-left: 4px; }
        @media (max-width: 480px) { .header-icon-hide-xs { display: none; } }

        .search-panel { position: absolute; top: 68px; left: 0; right: 0; background: #fff; border-top: 1px solid rgba(0,0,0,0.08); display: flex; align-items: center; padding: 0 clamp(16px, 4vw, 32px); height: 56px; z-index: 100; }
        .search-input { flex: 1; border: none; outline: none; font-family: StyreneA, sans-serif; font-size: 16px; color: #000; padding: 0 16px; background: transparent; min-width: 0; }
        @media (min-width: 768px) { .search-input { font-size: 14px; } }

        .mega-dropdown { position: absolute; top: 68px; left: 0; right: 0; background: #fff; border-top: 1px solid rgba(0,0,0,0.08); z-index: 100; display: none; align-items: flex-start; padding: 40px clamp(16px, 4vw, 32px); gap: 80px; }
        @media (min-width: 1024px) { .mega-dropdown.open { display: flex; } }
        .mega-col-title { font-family: StyreneA, sans-serif; font-size: 11px; font-weight: 400; color: rgba(0,0,0,0.45); margin: 0 0 16px; letter-spacing: 0.02em; }
        .mega-col-list { display: flex; flex-direction: column; gap: 12px; }
        .mega-col-link { font-family: StyreneA, sans-serif; font-size: 13px; font-weight: 400; color: #000; text-decoration: none; display: block; }
        .mega-image { margin-left: auto; width: 270px; height: 290px; flex-shrink: 0; overflow: hidden; }

        .mobile-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(90vw, 360px); background: #fff; z-index: 60; transform: translateX(100%); transition: transform .25s ease; display: flex; flex-direction: column; }
        .mobile-drawer.open { transform: translateX(0); }
        .mobile-drawer-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid rgba(0,0,0,0.08); height: 68px; flex-shrink: 0; }
        .mobile-drawer-body { flex: 1; overflow-y: auto; padding: 20px; }
        .mobile-section-title { font-family: StyreneA, sans-serif; font-size: 11px; font-weight: 400; color: rgba(0,0,0,0.45); margin: 24px 0 12px; letter-spacing: 0.04em; text-transform: uppercase; }
        .mobile-section-title:first-child { margin-top: 0; }
        .mobile-link { font-family: StyreneA, sans-serif; font-size: 15px; font-weight: 400; color: #000; text-decoration: none; display: block; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.06); }

        .header-overlay { position: fixed; inset: 0; background: rgba(18,18,18,0.5); z-index: 40; }
      `}</style>

      {/* Overlay */}
      {(dropdownOpen || searchOpen || mobileMenuOpen) && (
        <div onClick={closeAll} className="header-overlay" />
      )}

      <div className="header-wrapper" onMouseLeave={() => setDropdownOpen(false)}>
        <header className="header-bar">
          {/* Left: Logo + Desktop Nav */}
          <div className="header-left">
            <a href="/" className="header-logo">ARGON.</a>
            <nav className="header-nav-desktop">
              {navLinks.map((link) => (
                <div key={link.label} onMouseEnter={() => { setDropdownOpen(!!link.hasDropdown); setSearchOpen(false); }}>
                  <a href={link.href} className="header-nav-link">{link.label}</a>
                </div>
              ))}
            </nav>
          </div>

          {/* Right icons */}
          <div className="header-icons">
            <button onClick={openSearch} aria-label="Search" className="header-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            </button>

            <a href={isAuthenticated() ? (isAdmin() ? "/admin" : "/mi-cuenta") : "/login"} aria-label="Account" className="header-icon-link header-icon-hide-xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            </a>

            <button aria-label="Wishlist" className="header-icon-btn header-icon-hide-xs">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
              <span className="header-wishlist-count">{wishlistCount}</span>
            </button>

            <a href="/carrito" aria-label="Cart" className="header-icon-link">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
              <span className="header-cart-count">{count}</span>
            </a>

            {/* Hamburger - mobile only */}
            <button onClick={() => setMobileMenuOpen(true)} aria-label="Menu" className="header-icon-btn header-hamburger">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </button>
          </div>
        </header>

        {/* Search panel */}
        {searchOpen && (
          <div className="search-panel">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
            <input autoFocus type="text" placeholder="Buscar productos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={handleSearchKeyDown} className="search-input" />
            <button onClick={closeSearch} aria-label="Cerrar búsqueda" className="header-icon-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
            </button>
          </div>
        )}

        {/* Mega-menu (desktop only) */}
        <div className={`mega-dropdown${dropdownOpen ? " open" : ""}`}>
          {dropdownColumns.map((col) => (
            <div key={col.title}>
              <p className="mega-col-title">{col.title}</p>
              <div className="mega-col-list">
                {col.links.map((link) => (
                  <a key={link.label} href={link.href} className="mega-col-link">{link.label}</a>
                ))}
              </div>
            </div>
          ))}
          <div className="mega-image">
            <img src="/images/ai-originals/image/ai-image-06.png" alt="Featured collection" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      <aside className={`mobile-drawer${mobileMenuOpen ? " open" : ""}`} aria-hidden={!mobileMenuOpen}>
        <div className="mobile-drawer-header">
          <span className="header-logo">ARGON.</span>
          <button onClick={() => setMobileMenuOpen(false)} aria-label="Cerrar menú" className="header-icon-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="mobile-drawer-body">
          <p className="mobile-section-title">Navegación</p>
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="mobile-link" onClick={closeAll}>{link.label}</a>
          ))}

          {dropdownColumns.map((col) => (
            <div key={col.title}>
              <p className="mobile-section-title">{col.title}</p>
              {col.links.map((link) => (
                <a key={link.label} href={link.href} className="mobile-link" onClick={closeAll}>{link.label}</a>
              ))}
            </div>
          ))}

          <p className="mobile-section-title">Cuenta</p>
          <a href={isAuthenticated() ? (isAdmin() ? "/admin" : "/mi-cuenta") : "/login"} className="mobile-link" onClick={closeAll}>
            {isAuthenticated() ? "Mi cuenta" : "Iniciar sesión"}
          </a>
          <a href="/carrito" className="mobile-link" onClick={closeAll}>Carrito ({count})</a>
        </div>
      </aside>
    </>
  );
}

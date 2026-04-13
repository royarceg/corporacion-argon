"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

const navLinks = [
  { label: "Tienda", href: "/producto/acceso", hasDropdown: true },
  { label: "Novedades", href: "/producto/acceso" },
  { label: "Promociones", href: "/producto/acceso" },
  { label: "Blog", href: "/producto/acceso" },
];

const dropdownColumns = [
  {
    title: "Categorías",
    links: [
      { label: "Uniformes", href: "/producto/acceso" },
      { label: "Zapatos de Seguridad", href: "/producto/acceso" },
      { label: "Motocicleta", href: "/producto/acceso" },
      { label: "Seguridad", href: "/producto/acceso" },
      { label: "Protección", href: "/producto/acceso" },
      { label: "Ver Todo", href: "/producto/acceso" },
    ],
  },
  {
    title: "Destacado",
    links: [
      { label: "Novedades", href: "/producto/acceso" },
      { label: "Más Vendidos", href: "/producto/acceso" },
      { label: "Promocionales", href: "/producto/acceso" },
    ],
  },
  {
    title: "Colecciones",
    links: [
      { label: "Chaleco Reflectivo", href: "/producto/acceso" },
      { label: "Chaleco Antibalas", href: "/producto/acceso" },
      { label: "Jacket", href: "/producto/acceso" },
      { label: "Capa Impermeable", href: "/producto/acceso" },
      { label: "Set UOT", href: "/producto/acceso" },
      { label: "Camisa", href: "/producto/acceso" },
    ],
  },
];

export default function Header() {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const { count, openDrawer } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  function openSearch() { setSearchOpen(true); setDropdownOpen(false); }
  function closeSearch() { setSearchOpen(false); }
  function closeAll() { setSearchOpen(false); setDropdownOpen(false); }

  return (
    <>
      {/* Overlay — behind header, above page content */}
      {(dropdownOpen || searchOpen) && (
        <div
          onClick={closeAll}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(18,18,18,0.5)",
            zIndex: 40,
          }}
        />
      )}

      {/* Header wrapper — sticky, above overlay */}
      <div
        style={{
          position: "sticky",
          top: 0,
          width: "100%",
          maxWidth: "1400px",
          zIndex: 50,
          backgroundColor: "#ffffff",
        }}
        onMouseLeave={() => setDropdownOpen(false)}
      >
        {/* Header bar */}
        <header
          style={{
            width: "100%",
            height: "68px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 32px",
          }}
        >
          {/* Left: Logo + Nav */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {/* Logo */}
            <a
              href="/"
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "20px",
                fontWeight: 700,
                color: "#000000",
                textDecoration: "none",
                letterSpacing: "-0.02em",
              }}
            >
              ARGON.
            </a>

            {/* Nav */}
            <nav style={{ display: "flex", alignItems: "center" }}>
              {navLinks.map((link) => (
                <div
                  key={link.label}
                  onMouseEnter={() => { setDropdownOpen(!!link.hasDropdown); setSearchOpen(false); }}
                >
                  <a
                    href={link.href}
                    style={{
                      fontFamily: "Graphik, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#000000",
                      textDecoration: "none",
                      padding: "0 16px",
                      display: "block",
                      lineHeight: "68px",
                    }}
                  >
                    {link.label}
                  </a>
                </div>
              ))}
            </nav>
          </div>

            {/* Right icons */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              onClick={openSearch}
              aria-label="Search"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <a
              href="/stores"
              style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, color: "#000000", textDecoration: "none" }}
            >
              Sucursales
            </a>

            <a
              href={isAuthenticated() ? (isAdmin() ? "/admin" : "/mi-cuenta") : "/login"}
              aria-label="Account"
              style={{ display: "flex", alignItems: "center", textDecoration: "none" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </a>

            <button aria-label="Wishlist" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, color: "#000000" }}>0</span>
            </button>

            <button onClick={openDrawer} aria-label="Cart" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, color: "#000000" }}>{count}</span>
            </button>
          </div>
        </header>

        {/* Search bar panel */}
        {searchOpen && (
          <div
            style={{
              position: "absolute",
              top: "68px",
              left: 0,
              right: 0,
              backgroundColor: "#ffffff",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              padding: "0 32px",
              height: "56px",
              zIndex: 100,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              autoFocus
              type="text"
              placeholder="Search..."
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontFamily: "Graphik, sans-serif",
                fontSize: "14px",
                color: "#000000",
                padding: "0 16px",
                background: "transparent",
              }}
            />
            <button
              onClick={closeSearch}
              aria-label="Cerrar búsqueda"
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.5">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Mega-menu dropdown */}
        {dropdownOpen && (
          <div
            style={{
              position: "absolute",
              top: "68px",
              left: 0,
              right: 0,
              backgroundColor: "#ffffff",
              borderTop: "1px solid rgba(0,0,0,0.08)",
              zIndex: 100,
              display: "flex",
              alignItems: "flex-start",
              padding: "40px 32px",
              gap: "80px",
            }}
          >
            {/* 3 columns */}
            {dropdownColumns.map((col) => (
              <div key={col.title}>
                <p
                  style={{
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "11px",
                    fontWeight: 400,
                    color: "rgba(0,0,0,0.45)",
                    margin: "0 0 16px 0",
                    letterSpacing: "0.02em",
                  }}
                >
                  {col.title}
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {col.links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      style={{
                        fontFamily: "Graphik, sans-serif",
                        fontSize: "13px",
                        fontWeight: 400,
                        color: "#000000",
                        textDecoration: "none",
                        display: "block",
                      }}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}

            {/* Image */}
            <div style={{ marginLeft: "auto", width: "270px", height: "290px", flexShrink: 0, overflow: "hidden" }}>
              <img
                src="/images/ai-originals/image/ai-image-06.png"
                alt="Featured collection"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

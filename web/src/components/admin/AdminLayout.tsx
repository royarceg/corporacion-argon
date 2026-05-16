"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { key: "ordenes", label: "Órdenes", icon: "📦" },
  { key: "usuarios", label: "Usuarios", icon: "👥" },
  { key: "productos", label: "Productos", icon: "📋" },
  { key: "clientes", label: "Clientes", icon: "🏢" },
  { key: "variantes", label: "Variantes Color", icon: "🎨" },
];

interface AdminLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function AdminLayout({ activeTab, onTabChange, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <style>{`
        .adm-shell { display: flex; min-height: calc(100vh - 112px); min-height: calc(100svh - 112px); position: relative; }
        .adm-sidebar { width: 220px; border-right: 1px solid rgba(0,0,0,0.08); padding: 32px 0; display: flex; flex-direction: column; flex-shrink: 0; background: #fff; }
        @media (max-width: 1023px) {
          .adm-sidebar { position: fixed; top: 0; bottom: 0; left: 0; z-index: 80; transform: translateX(-100%); transition: transform 0.25s ease; width: min(80vw, 280px); box-shadow: 4px 0 20px rgba(0,0,0,0.08); padding-top: 20px; }
          .adm-sidebar.open { transform: translateX(0); }
        }
        .adm-overlay { display: none; }
        @media (max-width: 1023px) {
          .adm-overlay.show { display: block; position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 75; }
        }
        .adm-toggle { display: none; }
        @media (max-width: 1023px) {
          .adm-toggle { display: inline-flex; align-items: center; gap: 8px; padding: 10px 14px; background: #000; color: #fff; border: none; font-family: StyreneA, sans-serif; font-size: 13px; cursor: pointer; position: sticky; top: 0; z-index: 5; align-self: flex-start; margin: 12px 16px 0; }
        }
        .adm-content { flex: 1; padding: clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px); overflow-x: auto; min-width: 0; }
      `}</style>

      <div className="adm-shell">
        {/* Overlay for mobile */}
        <div className={`adm-overlay${sidebarOpen ? " show" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* Sidebar */}
        <aside className={`adm-sidebar${sidebarOpen ? " open" : ""}`}>
          <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", padding: "0 20px", margin: "0 0 16px 0" }}>
            Administración
          </p>

          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => { onTabChange(item.key); setSidebarOpen(false); }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 20px",
                  minHeight: "44px",
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  fontWeight: activeTab === item.key ? 500 : 400,
                  color: activeTab === item.key ? "#000" : "rgba(0,0,0,0.5)",
                  background: activeTab === item.key ? "rgba(0,0,0,0.04)" : "transparent",
                  border: "none",
                  borderLeft: activeTab === item.key ? "2px solid #000" : "2px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <span style={{ fontSize: "14px" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>

          <div style={{ marginTop: "auto", padding: "20px" }}>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 8px 0", overflowWrap: "anywhere" }}>
              {user?.email}
            </p>
            <button
              onClick={logout}
              style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)", background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "underline" }}
            >
              Cerrar sesión
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <button onClick={() => setSidebarOpen(true)} className="adm-toggle" aria-label="Abrir menú admin">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            Menú admin
          </button>
          <div className="adm-content">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}

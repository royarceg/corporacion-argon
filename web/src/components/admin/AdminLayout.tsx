"use client";

import { useAuth } from "@/context/AuthContext";

const navItems = [
  { key: "ordenes", label: "Órdenes", icon: "📦" },
  { key: "usuarios", label: "Usuarios", icon: "👥" },
  { key: "productos", label: "Productos", icon: "📋" },
  { key: "clientes", label: "Clientes", icon: "🏢" },
  { key: "variantes", label: "Variantes", icon: "🎨" },
];

interface AdminLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function AdminLayout({ activeTab, onTabChange, children }: AdminLayoutProps) {
  const { user, logout } = useAuth();

  return (
    <>
      <style>{`
        .adm-shell { display: flex; min-height: calc(100vh - 112px); min-height: calc(100svh - 112px); position: relative; }

        /* Desktop sidebar (1024px+) */
        .adm-sidebar { width: 220px; border-right: 1px solid rgba(0,0,0,0.08); padding: 32px 0; display: flex; flex-direction: column; flex-shrink: 0; background: #fff; }
        @media (max-width: 1023px) { .adm-sidebar { display: none; } }

        /* Mobile bottom tabs (<1024px) */
        .adm-bottom-tabs { display: none; }
        @media (max-width: 1023px) {
          .adm-bottom-tabs {
            display: flex;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 64px;
            background: #fff;
            border-top: 1px solid rgba(0,0,0,0.08);
            z-index: 50;
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
        }
        .adm-tab { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px; font-family: StyreneA, sans-serif; font-size: 9px; color: rgba(0,0,0,0.5); background: none; border: none; cursor: pointer; padding: 8px 2px; min-height: 44px; }
        .adm-tab.active { color: #000; font-weight: 500; }
        .adm-tab-icon { font-size: 18px; }

        /* Mobile admin top bar (logout + email) */
        .adm-mobile-bar { display: none; }
        @media (max-width: 1023px) {
          .adm-mobile-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(0,0,0,0.03); border-bottom: 1px solid rgba(0,0,0,0.06); }
          .adm-mobile-bar-email { font-family: StyreneA, sans-serif; font-size: 11px; color: rgba(0,0,0,0.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .adm-mobile-bar-logout { font-family: StyreneA, sans-serif; font-size: 11px; color: rgba(0,0,0,0.6); background: none; border: none; cursor: pointer; padding: 0; text-decoration: underline; flex-shrink: 0; margin-left: 12px; }
        }

        .adm-content { flex: 1; padding: clamp(20px, 4vw, 32px) clamp(16px, 4vw, 40px); overflow-x: auto; min-width: 0; }
        @media (max-width: 1023px) { .adm-content { padding-bottom: calc(80px + env(safe-area-inset-bottom)); } }
      `}</style>

      <div className="adm-shell">
        {/* Desktop sidebar */}
        <aside className="adm-sidebar">
          <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", padding: "0 20px", margin: "0 0 16px 0" }}>
            Administración
          </p>

          <nav style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => onTabChange(item.key)}
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
          {/* Mobile-only bar with email + logout (since they don't fit in bottom tabs) */}
          <div className="adm-mobile-bar">
            <span className="adm-mobile-bar-email">Admin: {user?.email}</span>
            <button onClick={logout} className="adm-mobile-bar-logout">Cerrar sesión</button>
          </div>

          <div className="adm-content">
            {children}
          </div>
        </div>

        {/* Mobile bottom tabs */}
        <nav className="adm-bottom-tabs" aria-label="Navegación admin">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => onTabChange(item.key)}
              className={`adm-tab${activeTab === item.key ? " active" : ""}`}
              aria-label={item.label}
            >
              <span className="adm-tab-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}

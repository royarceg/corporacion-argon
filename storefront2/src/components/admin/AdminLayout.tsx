"use client";

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

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 112px)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "220px",
          borderRight: "1px solid rgba(0,0,0,0.08)",
          padding: "32px 0",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <p style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "rgba(0,0,0,0.35)",
          padding: "0 20px",
          margin: "0 0 16px 0",
        }}>
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
                padding: "10px 20px",
                fontFamily: "Graphik, sans-serif",
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
          <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 8px 0" }}>
            {user?.email}
          </p>
          <button
            onClick={logout}
            style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "12px",
              color: "rgba(0,0,0,0.5)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, padding: "32px 40px", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}

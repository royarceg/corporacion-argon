"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const links = [
  { label: "Dashboard", href: "/mi-cuenta" },
  { label: "Mis Pedidos", href: "/mi-cuenta/pedidos" },
  { label: "Lista de Deseos", href: "/mi-cuenta/wishlist" },
];

export default function AccountSidebar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <aside style={{ width: "220px", flexShrink: 0 }}>
      {/* User info */}
      <div style={{ marginBottom: "32px" }}>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", fontWeight: 500, color: "#000", margin: "0 0 4px 0" }}>
          {user?.name}
        </p>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)", margin: 0 }}>
          {user?.email}
        </p>
      </div>

      {/* Nav links */}
      <nav style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== "/mi-cuenta" && pathname.startsWith(link.href));
          return (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: active ? 500 : 400,
                color: active ? "#000" : "rgba(0,0,0,0.6)",
                textDecoration: "none",
                padding: "10px 0",
                borderBottom: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              {link.label}
            </a>
          );
        })}
        <button
          onClick={logout}
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            color: "rgba(0,0,0,0.4)",
            background: "none",
            border: "none",
            padding: "10px 0",
            cursor: "pointer",
            textAlign: "left",
            marginTop: "8px",
          }}
        >
          Cerrar Sesión
        </button>
      </nav>
    </aside>
  );
}

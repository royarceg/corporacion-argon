"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function MiCuentaPage() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const { count, total } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated()) router.replace("/login");
    if (!loading && user?.role === "master_admin") router.replace("/admin");
  }, [loading, isAuthenticated, user, router]);

  if (loading || !user) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 32px", flex: 1 }}>
        <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: "0 0 48px 0", letterSpacing: "-0.02em" }}>
          Mi Cuenta
        </h1>

        <div style={{ display: "flex", gap: "80px", alignItems: "flex-start" }}>
          <AccountSidebar />

          {/* Dashboard content */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "24px" }}>

            {/* Welcome */}
            <div style={{ padding: "32px", backgroundColor: "#f5f4f4" }}>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.6)", margin: "0 0 4px 0" }}>Bienvenido de vuelta,</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, color: "#000", margin: 0 }}>{user.name}</p>
            </div>

            {/* Stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
              {[
                { label: "Items en carrito", value: count.toString() },
                { label: "Subtotal carrito", value: `$${parseFloat(total || "0").toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Rol", value: user.role === "master_admin" ? "Administrador" : "Cliente" },
              ].map((stat) => (
                <div key={stat.label} style={{ padding: "24px", border: "1px solid rgba(0,0,0,0.08)" }}>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 8px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>{stat.label}</p>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, color: "#000", margin: 0 }}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Quick links */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <a href="/productos" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#fff", backgroundColor: "#000", padding: "14px 24px", textDecoration: "none", textAlign: "center", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Ver Catálogo
              </a>
              <a href="/mi-cuenta/pedidos" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", backgroundColor: "#fff", padding: "14px 24px", textDecoration: "none", textAlign: "center", letterSpacing: "0.04em", textTransform: "uppercase", border: "1px solid #000" }}>
                Mis Pedidos
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

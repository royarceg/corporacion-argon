"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService, Order } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";

const statusLabel: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmado", cancelled: "Cancelado" };
const statusColor: Record<string, string> = { pending: "#d4a017", confirmed: "#3a6b3a", cancelled: "#9c0f0f" };

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("pending");

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) router.replace("/login");
      else if (!isAdmin()) router.replace("/productos");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (!loading && isAdmin()) {
      orderService.getAllOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [loading, isAdmin]);

  const displayed = orders.filter((o) => filter === "all" ? true : o.status === filter);

  if (loading) return null;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 32px", flex: 1 }}>

        {/* Header row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: 0, letterSpacing: "-0.02em" }}>
            Panel de Administración
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>{user?.name}</span>
            <button onClick={logout} style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", background: "none", border: "1px solid rgba(0,0,0,0.2)", padding: "8px 16px", cursor: "pointer" }}>
              Salir
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display: "flex", gap: "0", marginBottom: "32px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
          {(["pending", "confirmed", "all"] as const).map((f) => {
            const labels = { pending: "Pendientes", confirmed: "Confirmadas", all: "Todas" };
            return (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  color: filter === f ? "#000" : "rgba(0,0,0,0.4)",
                  fontWeight: filter === f ? 500 : 400,
                  background: "none",
                  border: "none",
                  borderBottom: filter === f ? "2px solid #000" : "2px solid transparent",
                  padding: "12px 20px",
                  cursor: "pointer",
                  marginBottom: "-1px",
                }}
              >
                {labels[f]} {f !== "all" && `(${orders.filter((o) => o.status === f).length})`}
              </button>
            );
          })}
        </div>

        {/* Orders table */}
        {fetching ? (
          <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando órdenes...</p>
        ) : displayed.length === 0 ? (
          <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", padding: "40px 0" }}>No hay órdenes en esta categoría.</p>
        ) : (
          <div>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "0 0 12px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              {["Orden", "Cliente", "PO", "Fecha", "Estado", "Total"].map((h) => (
                <p key={h} style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: 0 }}>{h}</p>
              ))}
            </div>

            {displayed.map((order: any) => (
              <div
                key={order.id}
                onClick={() => router.push(`/admin/ordenes/${order.id}`)}
                style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", cursor: "pointer" }}
              >
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 500, color: "#000", margin: 0 }}>{order.order_number}</p>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{order.company_name ?? "—"}</p>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{order.customer_po}</p>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{new Date(order.created_at).toLocaleDateString("es-CR")}</p>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", fontWeight: 500, color: statusColor[order.status], margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{statusLabel[order.status]}</p>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>₡{parseFloat(order.subtotal_confirmed ?? order.subtotal_initial).toLocaleString("es-CR")}</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

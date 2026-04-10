"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService, Order } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";

const statusLabel: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
};
const statusColor: Record<string, string> = {
  pending: "#d4a017",
  confirmed: "#3a6b3a",
  cancelled: "#9c0f0f",
};

export default function PedidosPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated()) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      orderService.getOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [loading, isAuthenticated]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 32px", flex: 1 }}>
        <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: "0 0 48px 0", letterSpacing: "-0.02em" }}>
          Mis Pedidos
        </h1>

        <div style={{ display: "flex", gap: "80px", alignItems: "flex-start" }}>
          <AccountSidebar />

          <div style={{ flex: 1 }}>
            {fetching ? (
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando pedidos...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.4)", marginBottom: "20px" }}>No tenés pedidos aún.</p>
                <a href="/productos" style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", textDecoration: "underline" }}>Explorar catálogo</a>
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "0 0 12px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  {["Orden", "PO Cliente", "Fecha", "Estado", "Total"].map((h) => (
                    <p key={h} style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: 0 }}>{h}</p>
                  ))}
                </div>

                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/mi-cuenta/pedidos/${order.id}`)}
                    style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", cursor: "pointer" }}
                  >
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 500, color: "#000", margin: 0 }}>{order.order_number}</p>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{order.customer_po}</p>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString("es-CR")}
                    </p>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", fontWeight: 500, color: statusColor[order.status], margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {statusLabel[order.status]}
                    </p>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                      ₡{parseFloat(order.subtotal_confirmed ?? order.subtotal_initial).toLocaleString("es-CR")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

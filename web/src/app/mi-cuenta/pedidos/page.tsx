"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { statusLabel, statusColor } from "@/utils/orderStatus";
import { orderService, Order } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";

export default function PedidosPage() {
  const { isAuthenticated, loading } = useRequireAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      orderService.getOrders()
        .then(setOrders)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [loading, isAuthenticated]);

  return (
    <div className="page-shell">
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "clamp(28px, 5vw, 48px) clamp(16px, 4vw, 32px)", flex: 1 }}>
        <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 400, color: "#000", margin: "0 0 clamp(28px, 5vw, 48px) 0", letterSpacing: "-0.02em" }}>
          Mis Pedidos
        </h1>

        <div className="pd-layout">
          <style>{`
            .pd-layout { display: flex; flex-direction: column; gap: clamp(24px, 4vw, 80px); align-items: stretch; }
            @media (min-width: 1024px) { .pd-layout { flex-direction: row; align-items: flex-start; } }
            .pd-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; min-width: 0; }
            .pd-table { min-width: 720px; }
          `}</style>
          <AccountSidebar />

          <div style={{ flex: 1, minWidth: 0 }} className="pd-table-wrap"><div className="pd-table">
            {fetching ? (
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando pedidos...</p>
            ) : orders.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.4)", marginBottom: "20px" }}>No tenés pedidos aún.</p>
                <a href="/productos" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", textDecoration: "underline" }}>Explorar catálogo</a>
              </div>
            ) : (
              <div>
                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "48px 1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "0 0 12px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  <div />
                  {["Orden", "PO Cliente", "Fecha", "Estado", "Total"].map((h) => (
                    <p key={h} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: 0 }}>{h}</p>
                  ))}
                </div>

                {orders.map((order) => (
                  <div
                    key={order.id}
                    onClick={() => router.push(`/mi-cuenta/pedidos/${order.id}`)}
                    style={{ display: "grid", gridTemplateColumns: "48px 1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", cursor: "pointer", alignItems: "center" }}
                  >
                    {/* Thumbnail */}
                    <div style={{ width: "48px", height: "48px", backgroundColor: "#f5f4f4", overflow: "hidden", flexShrink: 0 }}>
                      {order.first_image_url && (
                        <img
                          src={order.first_image_url}
                          alt={order.order_number}
                          style={{ width: "100%", height: "100%", objectFit: "contain" }}
                        />
                      )}
                    </div>

                    <div>
                      <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, color: "#000", margin: "0 0 2px 0" }}>{order.order_number}</p>
                      <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: 0 }}>
                        {order.items_count} {Number(order.items_count) === 1 ? "producto" : "productos"}
                      </p>
                    </div>

                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{order.customer_po}</p>

                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>
                      {new Date(order.created_at).toLocaleDateString("es-CR")}
                    </p>

                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: statusColor[order.status], margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {statusLabel[order.status]}
                    </p>

                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                      ${parseFloat(order.subtotal_confirmed ?? order.subtotal_initial).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div></div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

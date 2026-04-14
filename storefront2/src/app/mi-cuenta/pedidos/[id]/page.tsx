"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService, OrderDetail } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";

const statusLabel: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmado", cancelled: "Cancelado" };
const statusColor: Record<string, string> = { pending: "#d4a017", confirmed: "#3a6b3a", cancelled: "#9c0f0f" };

export default function PedidoDetailPage() {
  return (
    <Suspense>
      <PedidoDetailContent />
    </Suspense>
  );
}

function PedidoDetailContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const isNew = searchParams.get("new") === "1";
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated()) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      orderService.getOrderById(Number(id))
        .then(setOrder)
        .catch(() => router.replace("/mi-cuenta/pedidos"))
        .finally(() => setFetching(false));
    }
  }, [id, loading, isAuthenticated, router]);

  if (loading || fetching || !order) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
    </div>
  );

  const subtotal = parseFloat(order.subtotal_confirmed ?? order.subtotal_initial).toLocaleString("es-CR");

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 32px", flex: 1 }}>
        <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: "0 0 48px 0", letterSpacing: "-0.02em" }}>
          Pedido {order.order_number}
        </h1>

        <div style={{ display: "flex", gap: "80px", alignItems: "flex-start" }}>
          <AccountSidebar />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Success banner */}
            {isNew && (
              <div style={{ backgroundColor: "#f0f7f0", border: "1px solid #3a6b3a", padding: "16px 20px" }}>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#3a6b3a", margin: 0 }}>
                  ✓ Orden creada exitosamente. Recibirás un email de confirmación.
                </p>
              </div>
            )}

            {/* Order meta */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {[
                { label: "Orden", value: order.order_number },
                { label: "PO Cliente", value: order.customer_po },
                { label: "Fecha", value: new Date(order.created_at).toLocaleDateString("es-CR") },
                { label: "Estado", value: statusLabel[order.status] },
              ].map((m) => (
                <div key={m.label} style={{ padding: "20px", border: "1px solid rgba(0,0,0,0.08)" }}>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>{m.label}</p>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", fontWeight: 400, color: m.label === "Estado" ? statusColor[order.status] : "#000", margin: 0 }}>{m.value}</p>
                </div>
              ))}
            </div>

            {/* Items */}
            <div>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 16px 0" }}>Productos</p>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", padding: "0 0 10px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                {["Producto", "Cant.", "Precio unit.", "Total"].map((h) => (
                  <p key={h} style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: 0 }}>{h}</p>
                ))}
              </div>

              {order.items?.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", padding: "14px 0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                  <div>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 500, margin: "0 0 2px 0" }}>{item.product_name}</p>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)", margin: 0 }}>{item.product_sku}{item.color ? ` — ${item.color}` : ""}{item.size ? ` / ${item.size}` : ""}</p>
                  </div>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", margin: 0 }}>
                    {item.quantity_confirmed ?? item.quantity_requested}
                    {item.quantity_confirmed && item.quantity_confirmed !== item.quantity_requested && (
                      <span style={{ color: "rgba(0,0,0,0.4)", fontSize: "11px" }}> (sol. {item.quantity_requested})</span>
                    )}
                  </p>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", margin: 0 }}>
                    ₡{parseFloat(item.unit_price_confirmed ?? item.unit_price_initial).toLocaleString("es-CR")}
                  </p>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", margin: 0 }}>
                    ₡{parseFloat(item.line_total_confirmed ?? item.line_total_initial).toLocaleString("es-CR")}
                  </p>
                </div>
              ))}

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "16px" }}>
                <div style={{ display: "flex", gap: "40px" }}>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.6)", margin: 0 }}>Total</p>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", fontWeight: 500, margin: 0 }}>₡{subtotal}</p>
                </div>
              </div>
            </div>

            <a href="/mi-cuenta/pedidos" style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", textDecoration: "none" }}>
              ← Volver a mis pedidos
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

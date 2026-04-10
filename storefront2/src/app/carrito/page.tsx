"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CarritoPage() {
  const { items, total, updateItem, removeItem, clearCart } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [customerPo, setCustomerPo] = useState("");
  const [wantedDate, setWantedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!loading && !isAuthenticated()) {
    router.replace("/login");
    return null;
  }

  async function handleCreateOrder() {
    if (!customerPo.trim()) { setError("El número de PO del cliente es requerido."); return; }
    setSubmitting(true);
    setError("");
    try {
      const result = await orderService.createOrder(customerPo.trim(), wantedDate || undefined);
      await clearCart();
      router.push(`/mi-cuenta/pedidos/${result.id}?new=1`);
    } catch {
      setError("Ocurrió un error al crear la orden. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "40px 32px", flex: 1 }}>
        <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: "0 0 32px 0", letterSpacing: "-0.02em" }}>
          Shopping Bag
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "16px", color: "rgba(0,0,0,0.4)", marginBottom: "24px" }}>Tu carrito está vacío.</p>
            <a href="/productos" style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", textDecoration: "underline" }}>Ver catálogo</a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "60px", alignItems: "start" }}>

            {/* Products */}
            <div>
              {items.map((item) => (
                <div key={item.id} style={{ display: "grid", gridTemplateColumns: "120px 1fr auto", gap: "20px", padding: "24px 0", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                  <div style={{ backgroundColor: "#f5f4f4", aspectRatio: "3/4", overflow: "hidden" }}>
                    {item.image_url && <img src={item.image_url} alt={item.product_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", fontWeight: 400, margin: 0 }}>{item.product_name}</p>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: 0 }}>SKU: {item.product_sku}</p>
                    {item.color && <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: 0 }}>{item.color}{item.size ? ` / ${item.size}` : ""}</p>}
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", margin: "8px 0 0 0" }}>₡{parseFloat(item.unit_price).toLocaleString("es-CR")}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                      <button onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)} style={{ width: "28px", height: "28px", border: "1px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                      <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px" }}>{item.quantity}</span>
                      <button onClick={() => updateItem(item.id, item.quantity + 1)} style={{ width: "28px", height: "28px", border: "1px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", margin: 0 }}>₡{parseFloat(item.line_total).toLocaleString("es-CR")}</p>
                    <button onClick={() => removeItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5"><path d="M18 6 6 18M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "sticky", top: "100px" }}>
              <h2 style={{ fontFamily: "Graphik, sans-serif", fontSize: "16px", fontWeight: 400, margin: 0 }}>Resumen de Orden</h2>

              <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }} />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>Subtotal</span>
                <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px" }}>₡{parseFloat(total).toLocaleString("es-CR")}</span>
              </div>

              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: 0, lineHeight: 1.5 }}>
                Los precios son estimados. ARGOM confirmará las cantidades y precios finales.
              </p>

              <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }} />

              {/* PO Number */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  N° de Orden (PO) *
                </label>
                <input
                  type="text"
                  value={customerPo}
                  onChange={(e) => setCustomerPo(e.target.value)}
                  placeholder="ej. PO-2026-001"
                  style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)", padding: "10px 12px", outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {/* Wanted date */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Fecha deseada de entrega
                </label>
                <input
                  type="date"
                  value={wantedDate}
                  onChange={(e) => setWantedDate(e.target.value)}
                  style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)", padding: "10px 12px", outline: "none", width: "100%", boxSizing: "border-box" }}
                />
              </div>

              {error && <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "#9c0f0f", margin: 0 }}>{error}</p>}

              <button
                onClick={handleCreateOrder}
                disabled={submitting}
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#fff",
                  backgroundColor: submitting ? "rgba(0,0,0,0.4)" : "#000",
                  border: "none",
                  padding: "14px",
                  cursor: submitting ? "not-allowed" : "pointer",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {submitting ? "Enviando..." : "Crear Orden"}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

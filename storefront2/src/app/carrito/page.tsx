"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { productService, ApiProduct } from "@/services/productService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function CarritoPage() {
  const { items, total, count, updateItem, removeItem, clearCart, addToCart } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  const [customerPo, setCustomerPo] = useState("");
  const [wantedDate, setWantedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [related, setRelated] = useState<ApiProduct[]>([]);
  const [addingId, setAddingId] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated()) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      productService.getProducts().then((prods) => {
        const inCart = new Set(items.map((i) => i.product_id));
        setRelated(prods.filter((p) => !inCart.has(p.id)).slice(0, 4));
      }).catch(() => {});
    }
  }, [loading, isAuthenticated, items]);

  if (loading) return null;

  const formattedTotal = parseFloat(total).toLocaleString("es-CR", {
    style: "currency", currency: "CRC", minimumFractionDigits: 0,
  });

  async function handleCreateOrder() {
    if (!customerPo.trim()) { setError("El número de PO es requerido."); return; }
    setSubmitting(true);
    setError("");
    try {
      const orderItems = items.map((i) => ({ product_id: i.product_id, quantity: i.quantity }));
      const result = await orderService.createOrder(customerPo.trim(), orderItems, wantedDate || undefined);
      await clearCart();
      router.push(`/mi-cuenta/pedidos/${result.id}?new=1`);
    } catch {
      setError("Ocurrió un error al crear la orden. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickAdd(product: ApiProduct) {
    setAddingId(product.id);
    try { await addToCart(product.id, 1); }
    finally { setAddingId(null); }
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 40px 80px", flex: 1 }}>

        {/* Title */}
        <h1 style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "26px",
          fontWeight: 400,
          color: "#000",
          margin: "0 0 40px 0",
          textAlign: "center",
          letterSpacing: "-0.02em",
        }}>
          Shopping Bag
        </h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "100px 0" }}>
            <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "15px", color: "rgba(0,0,0,0.4)", marginBottom: "24px" }}>
              Tu carrito está vacío.
            </p>
            <a href="/productos" style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", textDecoration: "underline" }}>
              Ver catálogo
            </a>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "48px", alignItems: "start" }}>

            {/* ── Items ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px" }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    border: "1px solid rgba(0,0,0,0.12)",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Top: nombre + X */}
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "14px 16px 10px",
                  }}>
                    <div>
                      <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, color: "#000", margin: "0 0 3px 0", lineHeight: 1.35 }}>
                        {item.product_name}
                      </p>
                      {(item.color || item.size) && (
                        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.45)", margin: 0 }}>
                          {[item.color, item.size].filter(Boolean).join(" / ")}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", lineHeight: 0, flexShrink: 0, marginLeft: "8px" }}
                      aria-label="Eliminar"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  {/* Imagen */}
                  <div style={{ backgroundColor: "#f5f4f4", aspectRatio: "1/1", overflow: "hidden" }}>
                    {item.image_url
                      ? <img src={item.image_url} alt={item.product_name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      : <div style={{ width: "100%", height: "100%" }} />
                    }
                  </div>

                  {/* Qty controls centrados */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "14px 16px", gap: "0" }}>
                    <button
                      onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                      style={{ width: "32px", height: "32px", border: "1px solid rgba(0,0,0,0.15)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", minWidth: "40px", textAlign: "center", borderTop: "1px solid rgba(0,0,0,0.15)", borderBottom: "1px solid rgba(0,0,0,0.15)", height: "32px", lineHeight: "32px" }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      style={{ width: "32px", height: "32px", border: "1px solid rgba(0,0,0,0.15)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px 14px", borderTop: "1px solid rgba(0,0,0,0.07)" }}>
                    <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.45)" }}>Subtotal</span>
                    <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, color: "#000" }}>
                      {parseFloat(item.line_total).toLocaleString("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Panel derecho: Order Summary ── */}
            <div style={{ position: "sticky", top: "24px" }}>
              <div style={{ border: "1px solid rgba(0,0,0,0.12)", padding: "24px" }}>

                <h2 style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", fontWeight: 400, color: "#000", margin: "0 0 20px 0", textAlign: "center" }}>
                  Order Summary
                </h2>

                {/* Subtotal */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.6)" }}>Subtotal</span>
                  <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000" }}>{formattedTotal}</span>
                </div>

                {/* Total */}
                <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "20px", borderBottom: "1px solid rgba(0,0,0,0.08)", marginBottom: "20px" }}>
                  <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", fontWeight: 500 }}>Total</span>
                  <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", fontWeight: 500 }}>{formattedTotal}</span>
                </div>

                {/* PO Number */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                  <label style={{ fontFamily: "Graphik, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000" }}>
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

                {/* Fecha */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "20px" }}>
                  <label style={{ fontFamily: "Graphik, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "#000" }}>
                    Fecha deseada de entrega
                  </label>
                  <input
                    type="date"
                    value={wantedDate}
                    onChange={(e) => setWantedDate(e.target.value)}
                    style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)", padding: "10px 12px", outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                {/* Nota */}
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 20px 0", lineHeight: 1.6, textAlign: "center" }}>
                  Los precios son estimados. ARGON confirmará cantidades y precios finales antes de procesar.
                </p>

                {error && (
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "#9c0f0f", margin: "0 0 12px 0" }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={handleCreateOrder}
                  disabled={submitting}
                  style={{
                    width: "100%",
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#fff",
                    backgroundColor: submitting ? "rgba(0,0,0,0.4)" : "#000",
                    border: "none",
                    padding: "14px",
                    cursor: submitting ? "not-allowed" : "pointer",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {submitting ? "Enviando..." : "Crear Orden"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── También podría interesarte ── */}
        {related.length > 0 && (
          <div style={{ marginTop: "80px" }}>
            <h2 style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#000",
              letterSpacing: "-0.01em",
              margin: "0 0 32px 0",
            }}>
              Lo Que Necesitas Ahora
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px" }}>
              {related.map((product) => (
                <div
                  key={product.id}
                  style={{ display: "flex", flexDirection: "column", gap: "10px", cursor: "pointer" }}
                  onClick={() => router.push(`/productos/${product.id}`)}
                >
                  <div
                    style={{ position: "relative", aspectRatio: "3/4", backgroundColor: "#f5f4f4", overflow: "hidden" }}
                    onMouseEnter={(e) => {
                      const btn = e.currentTarget.querySelector<HTMLButtonElement>(".quick-add-btn");
                      if (btn) btn.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      const btn = e.currentTarget.querySelector<HTMLButtonElement>(".quick-add-btn");
                      if (btn) btn.style.opacity = "0";
                    }}
                  >
                    {product.images?.[0] && (
                      <img src={product.images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    )}
                    <button
                      className="quick-add-btn"
                      onClick={(e) => { e.stopPropagation(); handleQuickAdd(product); }}
                      disabled={addingId === product.id}
                      style={{
                        position: "absolute",
                        bottom: "10px",
                        right: "10px",
                        width: "32px",
                        height: "32px",
                        backgroundColor: "#fff",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        opacity: 0,
                        transition: "opacity 0.15s ease",
                      }}
                    >
                      {addingId === product.id
                        ? <span style={{ fontSize: "11px", color: "#000" }}>✓</span>
                        : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                      }
                    </button>
                  </div>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: 0, lineHeight: 1.3 }}>
                    {product.name}
                  </p>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.45)", margin: 0 }}>
                    Consultar precio
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

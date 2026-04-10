"use client";

import { useCart } from "@/context/CartContext";

export default function ShoppingBagDrawer() {
  const { items, total, count, drawerOpen, closeDrawer, updateItem, removeItem } = useCart();

  if (!drawerOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={closeDrawer}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(18,18,18,0.4)", zIndex: 200 }}
      />

      {/* Drawer */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "400px",
        backgroundColor: "#ffffff",
        zIndex: 201,
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "24px 24px 20px 24px",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}>
          <h2 style={{ fontFamily: "Graphik, sans-serif", fontSize: "16px", fontWeight: 400, margin: 0 }}>
            Shopping Bag
          </h2>
          <button onClick={closeDrawer} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 24px" }}>
          {items.length === 0 ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px" }}>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
                Tu carrito está vacío.
              </p>
              <a href="/productos" onClick={closeDrawer} style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", textDecoration: "underline" }}>
                Ver productos
              </a>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} style={{
                display: "flex",
                gap: "16px",
                padding: "20px 0",
                borderBottom: "1px solid rgba(0,0,0,0.08)",
              }}>
                {/* Image */}
                <div style={{ width: "80px", height: "100px", backgroundColor: "#f5f4f4", flexShrink: 0, overflow: "hidden" }}>
                  {item.image_url && (
                    <img src={item.image_url} alt={item.product_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, margin: 0, maxWidth: "200px", lineHeight: 1.4 }}>
                      {item.product_name}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, flexShrink: 0 }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
                        <path d="M18 6 6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  {item.color && <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: 0 }}>{item.color}{item.size ? ` / ${item.size}` : ""}</p>}
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", margin: 0 }}>
                    ₡{parseFloat(item.unit_price).toLocaleString("es-CR")}
                  </p>

                  {/* Qty controls */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
                    <button
                      onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                      style={{ width: "24px", height: "24px", border: "1px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                    <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px" }}>{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item.id, item.quantity + 1)}
                      style={{ width: "24px", height: "24px", border: "1px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)" }}>Subtotal ({count} items)</span>
              <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 500 }}>
                ₡{parseFloat(total).toLocaleString("es-CR")}
              </span>
            </div>
            <a
              href="/carrito"
              onClick={closeDrawer}
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: "#000000",
                padding: "14px",
                textDecoration: "none",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                boxSizing: "border-box",
              }}
            >
              Crear Orden
            </a>
          </div>
        )}
      </div>
    </>
  );
}

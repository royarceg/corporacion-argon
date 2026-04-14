"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { orderService, OrderDetail, OrderItem } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";

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

interface EditableItem {
  id: number;
  quantity_confirmed: string;
  unit_price_confirmed: string;
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [editables, setEditables] = useState<EditableItem[]>([]);
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) router.replace("/login");
      else if (!isAdmin()) router.replace("/productos");
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  useEffect(() => {
    if (!loading && isAdmin()) {
      orderService.getAdminOrderById(Number(id))
        .then((o) => {
          setOrder(o);
          setEditables(
            o.items.map((item) => ({
              id: item.id,
              quantity_confirmed: String(item.quantity_confirmed ?? item.quantity_requested),
              unit_price_confirmed: String(item.unit_price_confirmed ?? item.unit_price_initial),
            }))
          );
        })
        .catch(() => router.replace("/admin"))
        .finally(() => setFetching(false));
    }
  }, [id, loading, isAdmin, router]);

  function updateEditable(itemId: number, field: "quantity_confirmed" | "unit_price_confirmed", value: string) {
    setEditables((prev) => prev.map((e) => e.id === itemId ? { ...e, [field]: value } : e));
  }

  async function handleConfirm() {
    if (!order) return;
    setConfirming(true);
    setConfirmError("");
    try {
      const items = editables.map((e) => ({
        id: e.id,
        quantity_confirmed: Number(e.quantity_confirmed),
        unit_price_confirmed: Number(e.unit_price_confirmed),
      }));
      await orderService.confirmOrder(order.id, items);
      setConfirmed(true);
      setTimeout(() => router.push("/admin"), 1800);
    } catch {
      setConfirmError("No se pudo confirmar la orden. Intentá de nuevo.");
    } finally {
      setConfirming(false);
    }
  }

  if (loading || fetching || !order) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
          Cargando...
        </p>
      </div>
    );
  }

  const isPending = order.status === "pending";
  const subtotalConfirmed = editables.reduce(
    (sum, e) => sum + Number(e.quantity_confirmed) * Number(e.unit_price_confirmed),
    0
  );

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 32px 80px", flex: 1 }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              onClick={() => router.push("/admin")}
              style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              ← Volver
            </button>
            <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "22px", fontWeight: 400, color: "#000", margin: 0, letterSpacing: "-0.02em" }}>
              {order.order_number}
            </h1>
            <span style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: statusColor[order.status],
            }}>
              {statusLabel[order.status]}
            </span>
          </div>

          {isPending && (
            <button
              onClick={handleConfirm}
              disabled={confirming || confirmed}
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                backgroundColor: confirmed ? "#3a6b3a" : confirming ? "rgba(0,0,0,0.4)" : "#000",
                border: "none",
                padding: "12px 28px",
                cursor: confirming || confirmed ? "not-allowed" : "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "background-color 0.2s",
              }}
            >
              {confirmed ? "✓ Confirmada" : confirming ? "Confirmando..." : "Confirmar Orden"}
            </button>
          )}
        </div>

        {/* Info cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1px", backgroundColor: "rgba(0,0,0,0.08)", border: "1px solid rgba(0,0,0,0.08)", marginBottom: "40px" }}>
          {[
            { label: "Cliente", value: (order as any).company_name ?? "—" },
            { label: "PO del cliente", value: order.customer_po },
            { label: "Fecha de creación", value: new Date(order.created_at).toLocaleDateString("es-CR") },
            { label: "Entrega deseada", value: order.wanted_date ? new Date(order.wanted_date).toLocaleDateString("es-CR") : "—" },
          ].map((info) => (
            <div key={info.label} style={{ backgroundColor: "#ffffff", padding: "20px 24px" }}>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0" }}>
                {info.label}
              </p>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", color: "#000", margin: 0 }}>
                {info.value}
              </p>
            </div>
          ))}
        </div>

        {/* Items table */}
        <div style={{ border: "1px solid rgba(0,0,0,0.08)" }}>

          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isPending ? "2fr 1fr 1fr 1fr 1fr 1fr" : "2fr 1fr 1fr 1fr 1fr 1fr",
            gap: "16px",
            padding: "14px 24px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "#fafafa",
          }}>
            {["Producto", "SKU", "Cant. Pedida", isPending ? "Cant. Confirmada" : "Cant. Confirmada", isPending ? "Precio Unit." : "Precio Unit.", "Total"].map((h) => (
              <p key={h} style={{ fontFamily: "Graphik, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", margin: 0 }}>
                {h}
              </p>
            ))}
          </div>

          {/* Rows */}
          {order.items.map((item: OrderItem) => {
            const editable = editables.find((e) => e.id === item.id);
            const lineTotal = editable
              ? Number(editable.quantity_confirmed) * Number(editable.unit_price_confirmed)
              : Number(item.line_total_confirmed ?? item.line_total_initial);

            return (
              <div
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr 1fr",
                  gap: "16px",
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  alignItems: "center",
                }}
              >
                {/* Nombre */}
                <div>
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: "0 0 2px 0", fontWeight: 400 }}>
                    {(item as any).product_name ?? "—"}
                  </p>
                  {((item as any).color || (item as any).size) && (
                    <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.45)", margin: 0 }}>
                      {[(item as any).color, (item as any).size].filter(Boolean).join(" / ")}
                    </p>
                  )}
                </div>

                {/* SKU */}
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: 0 }}>
                  {(item as any).sku ?? "—"}
                </p>

                {/* Cant. Pedida */}
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                  {item.quantity_requested}
                </p>

                {/* Cant. Confirmada */}
                {isPending ? (
                  <input
                    type="number"
                    min="0"
                    value={editable?.quantity_confirmed ?? ""}
                    onChange={(e) => updateEditable(item.id, "quantity_confirmed", e.target.value)}
                    style={{
                      fontFamily: "Graphik, sans-serif",
                      fontSize: "13px",
                      border: "1px solid rgba(0,0,0,0.2)",
                      padding: "6px 10px",
                      width: "80px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                    {item.quantity_confirmed ?? "—"}
                  </p>
                )}

                {/* Precio Unit. */}
                {isPending ? (
                  <input
                    type="number"
                    min="0"
                    value={editable?.unit_price_confirmed ?? ""}
                    onChange={(e) => updateEditable(item.id, "unit_price_confirmed", e.target.value)}
                    style={{
                      fontFamily: "Graphik, sans-serif",
                      fontSize: "13px",
                      border: "1px solid rgba(0,0,0,0.2)",
                      padding: "6px 10px",
                      width: "100px",
                      outline: "none",
                    }}
                  />
                ) : (
                  <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                    {item.unit_price_confirmed
                      ? parseFloat(item.unit_price_confirmed).toLocaleString("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 })
                      : "—"}
                  </p>
                )}

                {/* Total línea */}
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                  {lineTotal.toLocaleString("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 })}
                </p>
              </div>
            );
          })}

          {/* Footer total */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "40px", padding: "16px 24px", borderTop: "1px solid rgba(0,0,0,0.1)", backgroundColor: "#fafafa" }}>
            <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 500, color: "rgba(0,0,0,0.5)", margin: 0 }}>
              Total {isPending ? "estimado" : "confirmado"}
            </p>
            <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", fontWeight: 500, color: "#000", margin: 0, minWidth: "120px", textAlign: "right" }}>
              {subtotalConfirmed.toLocaleString("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Error message */}
        {confirmError && (
          <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "#9c0f0f", marginTop: "16px" }}>
            {confirmError}
          </p>
        )}

        {/* Bottom confirm button (repeat for long orders) */}
        {isPending && order.items.length > 4 && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button
              onClick={handleConfirm}
              disabled={confirming || confirmed}
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                backgroundColor: confirmed ? "#3a6b3a" : confirming ? "rgba(0,0,0,0.4)" : "#000",
                border: "none",
                padding: "12px 28px",
                cursor: confirming || confirmed ? "not-allowed" : "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {confirmed ? "✓ Confirmada" : confirming ? "Confirmando..." : "Confirmar Orden"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

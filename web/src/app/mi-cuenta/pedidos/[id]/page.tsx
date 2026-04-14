"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { statusLabel, statusColor } from "@/utils/orderStatus";
import { orderService, OrderDetail, OrderItem } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";

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
  const { isAuthenticated, loading } = useRequireAuth();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [fetching, setFetching] = useState(true);

  // Edit mode state
  const [editing, setEditing] = useState(false);
  const [editPo, setEditPo] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editQtys, setEditQtys] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      orderService.getOrderById(Number(id))
        .then((o) => {
          setOrder(o);
          setEditPo(o.customer_po);
          setEditDate(o.wanted_date ?? "");
          const qtys: Record<number, number> = {};
          o.items?.forEach((item) => { qtys[item.id] = item.quantity_requested; });
          setEditQtys(qtys);
        })
        .catch(() => router.replace("/mi-cuenta/pedidos"))
        .finally(() => setFetching(false));
    }
  }, [id, loading, isAuthenticated, router]);

  async function handleSave() {
    if (!order) return;
    setSaving(true);
    setSaveError("");
    try {
      const itemsPayload = order.items?.map((item) => ({
        id: item.id,
        quantity: editQtys[item.id] ?? item.quantity_requested,
      })) ?? [];

      await orderService.updateOrder(order.id, {
        customer_po: editPo,
        wanted_date: editDate || undefined,
        items: itemsPayload,
      });

      // Refresh
      const updated = await orderService.getOrderById(order.id);
      setOrder(updated);
      const qtys: Record<number, number> = {};
      updated.items?.forEach((item) => { qtys[item.id] = item.quantity_requested; });
      setEditQtys(qtys);
      setEditing(false);
    } catch {
      setSaveError("No se pudo guardar. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!order) return;
    setDeleting(true);
    try {
      await orderService.deleteOrder(order.id);
      // Refrescar para mostrar estado "Cancelado" con trazabilidad
      const updated = await orderService.getOrderById(order.id);
      setOrder(updated);
      setConfirmDelete(false);
    } catch {
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  }

  if (loading || fetching || !order) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
    </div>
  );

  const isPending = order.status === "pending";
  const subtotal = parseFloat(order.subtotal_confirmed ?? order.subtotal_initial).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 32px", flex: 1 }}>

        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "48px" }}>
          <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: 0, letterSpacing: "-0.02em" }}>
            Pedido {order.order_number}
          </h1>

          {/* Actions for pending orders */}
          {isPending && !editing && (
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={() => setEditing(true)}
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#000",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(0,0,0,0.25)",
                  padding: "9px 20px",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Editar orden
              </button>
              <button
                onClick={() => setConfirmDelete(true)}
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#9c0f0f",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(156,15,15,0.3)",
                  padding: "9px 20px",
                  cursor: "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                Cancelar orden
              </button>
            </div>
          )}

          {/* Save / Cancel in edit mode */}
          {editing && (
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              {saveError && (
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#9c0f0f", margin: 0 }}>{saveError}</p>
              )}
              <button
                onClick={() => { setEditing(false); setSaveError(""); }}
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  color: "rgba(0,0,0,0.5)",
                  backgroundColor: "transparent",
                  border: "1px solid rgba(0,0,0,0.2)",
                  padding: "9px 20px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#fff",
                  backgroundColor: saving ? "rgba(0,0,0,0.4)" : "#000",
                  border: "none",
                  padding: "9px 20px",
                  cursor: saving ? "not-allowed" : "pointer",
                  letterSpacing: "0.02em",
                }}
              >
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "80px", alignItems: "flex-start" }}>
          <AccountSidebar />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "32px" }}>

            {/* Success banner */}
            {isNew && (
              <div style={{ backgroundColor: "#f0f7f0", border: "1px solid #3a6b3a", padding: "16px 20px" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#3a6b3a", margin: 0 }}>
                  ✓ Orden creada exitosamente. Recibirás un email de confirmación.
                </p>
              </div>
            )}

            {/* Order meta — editable in edit mode */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
              {/* Orden number — never editable */}
              <div style={{ padding: "20px", border: "1px solid rgba(0,0,0,0.08)" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Orden</p>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", fontWeight: 400, color: "#000", margin: 0 }}>{order.order_number}</p>
              </div>

              {/* PO — editable */}
              <div style={{ padding: "20px", border: editing ? "1px solid #000" : "1px solid rgba(0,0,0,0.08)" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>PO Cliente</p>
                {editing ? (
                  <input
                    type="text"
                    value={editPo}
                    onChange={(e) => setEditPo(e.target.value)}
                    style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "none", outline: "none", width: "100%", padding: 0, backgroundColor: "transparent" }}
                  />
                ) : (
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "#000", margin: 0 }}>{order.customer_po}</p>
                )}
              </div>

              {/* Fecha — never editable */}
              <div style={{ padding: "20px", border: "1px solid rgba(0,0,0,0.08)" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Fecha</p>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "#000", margin: 0 }}>{new Date(order.created_at).toLocaleDateString("es-CR")}</p>
              </div>

              {/* Estado */}
              <div style={{ padding: "20px", border: "1px solid rgba(0,0,0,0.08)" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Estado</p>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", fontWeight: 400, color: statusColor[order.status], margin: 0 }}>{statusLabel[order.status]}</p>
              </div>
            </div>

            {/* Wanted date — editable */}
            {(order.wanted_date || editing) && (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxWidth: "240px" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: 0, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Fecha deseada de entrega
                </p>
                {editing ? (
                  <input
                    type="date"
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)", padding: "8px 12px", outline: "none" }}
                  />
                ) : (
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                    {order.wanted_date ? new Date(order.wanted_date).toLocaleDateString("es-CR") : "—"}
                  </p>
                )}
              </div>
            )}

            {/* Comentarios — trazabilidad */}
            {((order as any).comments || (order as any).admin_comments) && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
                <div>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0" }}>
                    Mis comentarios
                  </p>
                  <div style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", border: "1px solid rgba(0,0,0,0.1)", padding: "12px", minHeight: "40px", backgroundColor: "#fafafa", lineHeight: 1.5 }}>
                    {(order as any).comments || <span style={{ color: "rgba(0,0,0,0.3)" }}>—</span>}
                  </div>
                </div>
                <div>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0" }}>
                    Respuesta de ARGON
                  </p>
                  <div style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", border: "1px solid rgba(0,0,0,0.1)", padding: "12px", minHeight: "40px", backgroundColor: "#fafafa", lineHeight: 1.5 }}>
                    {(order as any).admin_comments || <span style={{ color: "rgba(0,0,0,0.3)" }}>Pendiente</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 16px 0" }}>Productos</p>

              {/* Table header */}
              <div style={{ display: "grid", gridTemplateColumns: "56px 2fr 1fr 1fr 1fr", gap: "12px", padding: "0 0 10px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                <div />
                {["Producto", "Cant.", "Precio unit.", "Total"].map((h) => (
                  <p key={h} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: 0 }}>{h}</p>
                ))}
              </div>

              {order.items?.map((item) => {
                const qty = editQtys[item.id] ?? item.quantity_requested;
                return (
                  <div key={item.id} style={{ display: "grid", gridTemplateColumns: "56px 2fr 1fr 1fr 1fr", gap: "12px", padding: "16px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", alignItems: "center" }}>

                    {/* Product image */}
                    <div style={{ width: "56px", height: "56px", backgroundColor: "#f5f4f4", overflow: "hidden", flexShrink: 0 }}>
                      {item.image_url && (
                        <img src={item.image_url} alt={item.product_name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      )}
                    </div>

                    {/* Name + SKU */}
                    <div>
                      <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, margin: "0 0 2px 0" }}>{item.product_name}</p>
                      <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)", margin: 0 }}>
                        {item.product_sku}{item.color ? ` — ${item.color}` : ""}{item.size ? ` / ${item.size}` : ""}
                      </p>
                    </div>

                    {/* Quantity — editable */}
                    <div>
                      {editing ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0", border: "1px solid rgba(0,0,0,0.2)", width: "fit-content" }}>
                          <button
                            onClick={() => setEditQtys((prev) => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] ?? item.quantity_requested) - 1) }))}
                            style={{ width: "28px", height: "28px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={qty}
                            onChange={(e) => {
                              const v = parseInt(e.target.value);
                              if (!isNaN(v) && v >= 0) setEditQtys((prev) => ({ ...prev, [item.id]: v }));
                            }}
                            style={{
                              fontFamily: "StyreneA, sans-serif",
                              fontSize: "13px",
                              width: "44px",
                              textAlign: "center",
                              borderTop: "none",
                              borderBottom: "none",
                              borderLeft: "1px solid rgba(0,0,0,0.2)",
                              borderRight: "1px solid rgba(0,0,0,0.2)",
                              height: "28px",
                              outline: "none",
                            } as React.CSSProperties}
                          />
                          <button
                            onClick={() => setEditQtys((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? item.quantity_requested) + 1 }))}
                            style={{ width: "28px", height: "28px", border: "none", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          >
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                          </button>
                        </div>
                      ) : (
                        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", margin: 0 }}>
                          {item.quantity_confirmed ?? item.quantity_requested}
                          {item.quantity_confirmed && item.quantity_confirmed !== item.quantity_requested && (
                            <span style={{ color: "rgba(0,0,0,0.4)", fontSize: "11px" }}> (sol. {item.quantity_requested})</span>
                          )}
                        </p>
                      )}
                      {editing && qty === 0 && (
                        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", color: "#9c0f0f", margin: "4px 0 0 0" }}>Se eliminará</p>
                      )}
                    </div>

                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", margin: 0 }}>
                      ${parseFloat(item.unit_price_confirmed ?? item.unit_price_initial).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", margin: 0 }}>
                      ${parseFloat(item.line_total_confirmed ?? item.line_total_initial).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                );
              })}

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: "16px" }}>
                <div style={{ display: "flex", gap: "40px" }}>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.6)", margin: 0 }}>Total por confirmar</p>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", fontWeight: 500, margin: 0 }}>${subtotal}</p>
                </div>
              </div>
            </div>

            <a href="/mi-cuenta/pedidos" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", textDecoration: "none" }}>
              ← Volver a mis pedidos
            </a>
          </div>
        </div>
      </main>

      <Footer />

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <>
          <div
            onClick={() => !deleting && setConfirmDelete(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 300 }}
          />
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#ffffff",
            zIndex: 301,
            padding: "40px",
            width: "min(440px, 90vw)",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
          }}>
            <h2 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "18px", fontWeight: 400, color: "#000", margin: 0, letterSpacing: "-0.01em" }}>
              Cancelar orden
            </h2>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.6)", margin: 0, lineHeight: 1.6 }}>
              ¿Estás seguro de que querés cancelar la orden <strong>{order.order_number}</strong>? La orden quedará registrada como cancelada.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", backgroundColor: "transparent", border: "1px solid rgba(0,0,0,0.2)", padding: "10px 20px", cursor: "pointer" }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, color: "#fff", backgroundColor: deleting ? "rgba(156,15,15,0.4)" : "#9c0f0f", border: "none", padding: "10px 20px", cursor: deleting ? "not-allowed" : "pointer" }}
              >
                {deleting ? "Cancelando..." : "Sí, cancelar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

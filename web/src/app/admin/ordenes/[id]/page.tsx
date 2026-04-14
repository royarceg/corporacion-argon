"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { statusLabel, statusColor } from "@/utils/orderStatus";
import { formatPrice } from "@/utils/formatPrice";
import { orderService, OrderDetail, OrderItem } from "@/services/orderService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";

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
  const [adminComments, setAdminComments] = useState("");

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
          setAdminComments((o as any).admin_comments || "");
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
      await orderService.confirmOrder(order.id, items, adminComments.trim() || undefined);
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
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
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
              style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              ← Volver
            </button>
            <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "22px", fontWeight: 400, color: "#000", margin: 0, letterSpacing: "-0.02em" }}>
              {order.order_number}
            </h1>
            <span style={{
              fontFamily: "StyreneA, sans-serif",
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
                fontFamily: "StyreneA, sans-serif",
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
            { label: "Creado por", value: (order as any).created_by_name ? `${(order as any).created_by_name} (${(order as any).created_by})` : (order as any).created_by ?? "—" },
            { label: "PO del cliente", value: order.customer_po },
            { label: "Fecha de creación", value: new Date(order.created_at).toLocaleDateString("es-CR") },
          ].map((info) => (
            <div key={info.label} style={{ backgroundColor: "#ffffff", padding: "20px 24px" }}>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0" }}>
                {info.label}
              </p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "#000", margin: 0 }}>
                {info.value}
              </p>
            </div>
          ))}
        </div>

        {/* Export buttons */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          <button
            onClick={() => exportPDF(order, editables, isPending, subtotalConfirmed)}
            style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "7px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Exportar PDF
          </button>
          <button
            onClick={() => exportExcel(order, isPending)}
            style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "7px 14px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            Exportar Excel
          </button>
        </div>

        {/* Items table */}
        <div style={{ border: "1px solid rgba(0,0,0,0.08)" }}>

          {/* Table header: SKU - Producto - Imagen - Cant. Pedida - Cant. Confirmada - Precio Unit. - Total */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "0.8fr 2fr 60px 0.8fr 0.8fr 1fr 1fr",
            gap: "12px",
            padding: "14px 24px",
            borderBottom: "1px solid rgba(0,0,0,0.08)",
            backgroundColor: "#fafafa",
          }}>
            {["SKU", "Producto", "Img", "Cant. Pedida", "Cant. Confirm.", "Precio Unit.", "Total"].map((h) => (
              <p key={h} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(0,0,0,0.45)", margin: 0 }}>
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
                  gridTemplateColumns: "0.8fr 2fr 60px 0.8fr 0.8fr 1fr 1fr",
                  gap: "12px",
                  padding: "14px 24px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  alignItems: "center",
                }}
              >
                {/* SKU */}
                <p style={{ fontFamily: "monospace", fontSize: "11px", color: "rgba(0,0,0,0.6)", margin: 0 }}>
                  {(item as any).product_sku ?? (item as any).sku ?? "—"}
                </p>

                {/* Producto */}
                <div>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: "0 0 2px 0" }}>
                    {(item as any).product_name ?? "—"}
                  </p>
                  {((item as any).color || (item as any).size) && (
                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", color: "rgba(0,0,0,0.4)", margin: 0 }}>
                      {[(item as any).color, (item as any).size].filter(Boolean).join(" / ")}
                    </p>
                  )}
                  {(item as any).note && (
                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", color: "#0369a1", margin: "2px 0 0 0", fontStyle: "italic" }}>
                      Nota: {(item as any).note}
                    </p>
                  )}
                </div>

                {/* Imagen */}
                <div style={{ width: "44px", height: "44px", backgroundColor: "#f5f4f4", borderRadius: "4px", overflow: "hidden" }}>
                  {(item as any).image_url && (
                    <img src={(item as any).image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  )}
                </div>

                {/* Cant. Pedida */}
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>
                  {item.quantity_requested}
                </p>

                {/* Cant. Confirmada */}
                {isPending ? (
                  <input type="number" min="0" value={editable?.quantity_confirmed ?? ""} onChange={(e) => updateEditable(item.id, "quantity_confirmed", e.target.value)}
                    style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)", padding: "6px 10px", width: "80px", outline: "none" }} />
                ) : (
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>{item.quantity_confirmed ?? "—"}</p>
                )}

                {/* Precio Unit. */}
                {isPending ? (
                  <input type="number" min="0" value={editable?.unit_price_confirmed ?? ""} onChange={(e) => updateEditable(item.id, "unit_price_confirmed", e.target.value)}
                    style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)", padding: "6px 10px", width: "100px", outline: "none" }} />
                ) : (
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>{item.unit_price_confirmed ? formatPrice(item.unit_price_confirmed) : "—"}</p>
                )}

                {/* Total */}
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>{formatPrice(lineTotal)}</p>
              </div>
            );
          })}

          {/* Footer total */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "40px", padding: "16px 24px", borderTop: "1px solid rgba(0,0,0,0.1)", backgroundColor: "#fafafa" }}>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, color: "rgba(0,0,0,0.5)", margin: 0 }}>
              Total {isPending ? "estimado" : "confirmado"}
            </p>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", fontWeight: 500, color: "#000", margin: 0, minWidth: "120px", textAlign: "right" }}>
              {formatPrice(subtotalConfirmed)}
            </p>
          </div>
        </div>

        {/* Comentarios — ABAJO de la tabla */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "32px" }}>
          <div>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0" }}>
              Comentarios del cliente
            </p>
            <div style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", border: "1px solid rgba(0,0,0,0.1)", padding: "12px", minHeight: "60px", backgroundColor: "#fafafa", lineHeight: 1.5 }}>
              {(order as any).comments || <span style={{ color: "rgba(0,0,0,0.3)" }}>Sin comentarios</span>}
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.4)", margin: "0 0 6px 0" }}>
              Respuesta del administrador
            </p>
            {isPending ? (
              <textarea value={adminComments} onChange={(e) => setAdminComments(e.target.value)} placeholder="Confirmar cambios, notas internas, observaciones..." rows={3}
                style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)", padding: "12px", outline: "none", width: "100%", boxSizing: "border-box", resize: "vertical", lineHeight: 1.5 }} />
            ) : (
              <div style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", border: "1px solid rgba(0,0,0,0.1)", padding: "12px", minHeight: "60px", backgroundColor: "#fafafa", lineHeight: 1.5 }}>
                {(order as any).admin_comments || <span style={{ color: "rgba(0,0,0,0.3)" }}>Sin respuesta</span>}
              </div>
            )}
          </div>
        </div>

        {/* Error message */}
        {confirmError && (
          <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#9c0f0f", marginTop: "16px" }}>
            {confirmError}
          </p>
        )}

        {/* Bottom confirm button */}
        {isPending && (
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
            <button
              onClick={handleConfirm}
              disabled={confirming || confirmed}
              style={{
                fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500,
                color: "#fff", backgroundColor: confirmed ? "#3a6b3a" : confirming ? "rgba(0,0,0,0.4)" : "#000",
                border: "none", padding: "12px 28px", cursor: confirming || confirmed ? "not-allowed" : "pointer",
                letterSpacing: "0.06em", textTransform: "uppercase",
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

/* ── Export functions ── */
function exportPDF(order: OrderDetail, editables: { id: number; quantity_confirmed: string; unit_price_confirmed: string }[], isPending: boolean, subtotal: number) {
  const w = window.open("", "_blank");
  if (!w) return;

  const rows = order.items.map((item: any) => {
    const ed = editables.find((e) => e.id === item.id);
    const qty = isPending ? (ed?.quantity_confirmed ?? item.quantity_requested) : (item.quantity_confirmed ?? item.quantity_requested);
    const price = isPending ? (ed?.unit_price_confirmed ?? item.unit_price_initial) : (item.unit_price_confirmed ?? item.unit_price_initial);
    const total = Number(qty) * Number(price);
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;font-family:monospace;font-size:11px">${item.product_sku || "—"}</td>
      <td style="padding:8px;border-bottom:1px solid #eee">${item.product_name || "—"}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${Number(price).toFixed(2)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${total.toFixed(2)}</td>
    </tr>`;
  }).join("");

  w.document.write(`<!DOCTYPE html><html><head><title>Orden ${order.order_number}</title>
  <style>body{font-family:Arial,sans-serif;padding:40px;color:#000}table{width:100%;border-collapse:collapse}th{text-align:left;padding:8px;border-bottom:2px solid #000;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#555}h1{font-size:22px;font-weight:normal;margin:0 0 4px}p{margin:4px 0}.meta{display:flex;gap:40px;margin:20px 0 30px}.meta div p:first-child{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#888}.total-row{text-align:right;font-size:16px;font-weight:bold;padding:16px 8px;border-top:2px solid #000}.comments{margin-top:30px;padding:16px;background:#f9f9f9;border:1px solid #eee}.comments h3{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#888;margin:0 0 8px}@media print{body{padding:20px}}</style>
  </head><body>
  <h1>Orden de Compra: ${order.order_number}</h1>
  <p style="color:#888">Estado: ${order.status.toUpperCase()}</p>
  <div class="meta">
    <div><p>Cliente</p><p><strong>${(order as any).company_name || "—"}</strong></p></div>
    <div><p>Creado por</p><p><strong>${(order as any).created_by_name ? `${(order as any).created_by_name} (${(order as any).created_by})` : (order as any).created_by || "—"}</strong></p></div>
    <div><p>PO</p><p><strong>${order.customer_po}</strong></p></div>
    <div><p>Fecha</p><p><strong>${new Date(order.created_at).toLocaleDateString("es-CR")}</strong></p></div>
  </div>
  <table><thead><tr><th>SKU</th><th>Producto</th><th style="text-align:center">Cantidad</th><th style="text-align:right">Precio Unit.</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table>
  <p class="total-row">Total: $${subtotal.toFixed(2)}</p>
  ${(order as any).comments ? `<div class="comments"><h3>Comentarios del cliente</h3><p>${(order as any).comments}</p></div>` : ""}
  ${(order as any).admin_comments ? `<div class="comments"><h3>Respuesta del administrador</h3><p>${(order as any).admin_comments}</p></div>` : ""}
  <script>setTimeout(()=>window.print(),300)</script>
  </body></html>`);
  w.document.close();
}

function exportExcel(order: OrderDetail, isPending: boolean) {
  const headers = ["SKU", "Producto", "Cantidad Pedida", "Cantidad Confirmada", "Precio Unitario", "Total"];
  const rows = order.items.map((item: any) => {
    const qty = item.quantity_confirmed ?? item.quantity_requested;
    const price = item.unit_price_confirmed ?? item.unit_price_initial;
    return [
      item.product_sku || "",
      item.product_name || "",
      item.quantity_requested,
      item.quantity_confirmed ?? "",
      Number(price).toFixed(2),
      (Number(qty) * Number(price)).toFixed(2),
    ].join("\t");
  });

  const tsv = [headers.join("\t"), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + tsv], { type: "text/tab-separated-values;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Orden_${order.order_number}.xls`;
  a.click();
  URL.revokeObjectURL(url);
}

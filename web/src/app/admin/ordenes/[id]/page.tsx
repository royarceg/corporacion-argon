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
                  {(item as any).sku_variant || (item as any).product_sku || "—"}
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
                      Cliente: {(item as any).note}
                    </p>
                  )}
                  {isPending ? (
                    <input
                      type="text"
                      placeholder="Respuesta admin..."
                      defaultValue={(item as any).admin_note || ""}
                      onBlur={(e) => {
                        (item as any)._adminNote = e.target.value.trim();
                      }}
                      style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", color: "#7c3aed", border: "none", borderBottom: "1px solid rgba(0,0,0,0.1)", padding: "3px 0", marginTop: "4px", width: "100%", outline: "none", background: "transparent" }}
                    />
                  ) : (item as any).admin_note ? (
                    <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", color: "#7c3aed", margin: "2px 0 0 0", fontStyle: "italic" }}>
                      Admin: {(item as any).admin_note}
                    </p>
                  ) : null}
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

        {/* Comentarios por producto ya están inline en cada fila */}

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

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "PENDIENTE", color: "#d4a017" },
    confirmed: { label: "CONFIRMADA", color: "#2e7d32" },
    cancelled: { label: "CANCELADA", color: "#c62828" },
  };
  const st = statusMap[order.status] || statusMap.pending;

  const rows = order.items.map((item: any, i: number) => {
    const ed = editables.find((e) => e.id === item.id);
    const qty = isPending ? (ed?.quantity_confirmed ?? item.quantity_requested) : (item.quantity_confirmed ?? item.quantity_requested);
    const price = isPending ? (ed?.unit_price_confirmed ?? item.unit_price_initial) : (item.unit_price_confirmed ?? item.unit_price_initial);
    const total = Number(qty) * Number(price);
    const bg = i % 2 === 0 ? "#ffffff" : "#f9fafb";
    const note = item.note ? `<div style="font-size:9px;color:#0369a1;font-style:italic;margin-top:2px">Cliente: ${item.note}</div>` : "";
    const variant = [item.color, item.size].filter(Boolean).join(" / ");
    const variantHtml = variant ? `<div style="font-size:9px;color:#888">${variant}</div>` : "";
    return `<tr style="background:${bg}">
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:10px;color:#555">${item.sku_variant || item.product_sku || "—"}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-size:12px">${item.product_name || "—"}${variantHtml}${note}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center;font-size:12px">${qty}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-size:12px">$${Number(price).toFixed(2)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-size:12px;font-weight:600">$${total.toFixed(2)}</td>
    </tr>`;
  }).join("");

  const createdBy = (order as any).created_by_name
    ? `${(order as any).created_by_name} (${(order as any).created_by})`
    : (order as any).created_by || "—";

  w.document.write(`<!DOCTYPE html><html><head><title>Orden ${order.order_number} — CORPORACIÓN ARGON</title>
  <style>
    * { box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; color: #1a1a1a; }
    .header { background: #000; color: #fff; padding: 32px 48px; display: flex; justify-content: space-between; align-items: center; }
    .header h1 { font-size: 28px; font-weight: 700; letter-spacing: 2px; margin: 0; }
    .header .tagline { font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: rgba(255,255,255,0.5); margin-top: 4px; }
    .header .order-badge { text-align: right; }
    .header .order-num { font-size: 20px; font-weight: 300; letter-spacing: 1px; }
    .header .status { display: inline-block; padding: 4px 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; border-radius: 3px; margin-top: 6px; }
    .content { padding: 32px 48px; }
    .meta-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e5e7eb; border: 1px solid #e5e7eb; margin-bottom: 32px; }
    .meta-card { background: #fff; padding: 16px 20px; }
    .meta-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1.5px; color: #888; margin: 0 0 4px; }
    .meta-value { font-size: 13px; font-weight: 600; margin: 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    th { text-align: left; padding: 10px 12px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #fff; background: #1a1a1a; }
    th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: right; }
    .total-bar { background: #f9fafb; border-top: 2px solid #000; padding: 16px 12px; text-align: right; font-size: 15px; }
    .total-bar strong { font-size: 18px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #aaa; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } .header { -webkit-print-color-adjust: exact; } }
  </style>
  </head><body>
    <div class="header">
      <div>
        <h1>CORPORACIÓN ARGON.</h1>
        <p class="tagline">Insumos y Uniformes para empresas</p>
      </div>
      <div class="order-badge">
        <div class="order-num">${order.order_number}</div>
        <div class="status" style="background:${st.color};color:#fff">${st.label}</div>
      </div>
    </div>

    <div class="content">
      <div class="meta-grid">
        <div class="meta-card"><p class="meta-label">Cliente</p><p class="meta-value">${(order as any).company_name || "—"}</p></div>
        <div class="meta-card"><p class="meta-label">Creado por</p><p class="meta-value">${createdBy}</p></div>
        <div class="meta-card"><p class="meta-label">PO del cliente</p><p class="meta-value">${order.customer_po}</p></div>
        <div class="meta-card"><p class="meta-label">Fecha</p><p class="meta-value">${new Date(order.created_at).toLocaleDateString("es-CR")}</p></div>
      </div>

      <table>
        <thead><tr><th>SKU</th><th>Producto</th><th style="text-align:center">Cant.</th><th>Precio Unit.</th><th>Total</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="total-bar">
        Total ${isPending ? "estimado" : "confirmado"}: <strong>$${subtotal.toFixed(2)}</strong>
      </div>

      <div class="footer">
        <span>Generado el ${new Date().toLocaleDateString("es-CR")} · CORPORACIÓN ARGON</span>
        <span>Este documento es informativo. Precios sujetos a confirmación.</span>
      </div>
    </div>

    <script>setTimeout(()=>window.print(),400)</script>
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

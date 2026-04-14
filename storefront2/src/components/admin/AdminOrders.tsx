"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { orderService, Order } from "@/services/orderService";

const statusLabel: Record<string, string> = { pending: "Pendiente", confirmed: "Confirmado", cancelled: "Cancelado" };
const statusColor: Record<string, string> = { pending: "#d4a017", confirmed: "#3a6b3a", cancelled: "#9c0f0f" };

export default function AdminOrders() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "confirmed">("pending");

  useEffect(() => {
    orderService.getAllOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setFetching(false));
  }, []);

  const displayed = orders.filter((o) => filter === "all" ? true : o.status === filter);
  const pending = orders.filter((o) => o.status === "pending").length;
  const confirmed = orders.filter((o) => o.status === "confirmed").length;

  return (
    <>
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "32px" }}>
        {[
          { label: "Pendientes", value: pending, color: "#d4a017" },
          { label: "Confirmadas", value: confirmed, color: "#3a6b3a" },
          { label: "Total", value: orders.length, color: "#000" },
        ].map((s) => (
          <div key={s.label} style={{ border: "1px solid rgba(0,0,0,0.08)", padding: "20px" }}>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 8px 0" }}>{s.label}</p>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "28px", fontWeight: 300, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0", marginBottom: "24px", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
        {(["pending", "confirmed", "all"] as const).map((f) => {
          const labels = { pending: "Pendientes", confirmed: "Confirmadas", all: "Todas" };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                fontFamily: "StyreneA, sans-serif", fontSize: "13px",
                color: filter === f ? "#000" : "rgba(0,0,0,0.4)",
                fontWeight: filter === f ? 500 : 400,
                background: "none", border: "none",
                borderBottom: filter === f ? "2px solid #000" : "2px solid transparent",
                padding: "12px 20px", cursor: "pointer", marginBottom: "-1px",
              }}
            >
              {labels[f]}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {fetching ? (
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
      ) : displayed.length === 0 ? (
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", padding: "40px 0" }}>No hay órdenes.</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "0 0 12px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
            {["Orden", "Cliente", "PO", "Fecha", "Estado", "Total"].map((h) => (
              <p key={h} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", margin: 0 }}>{h}</p>
            ))}
          </div>
          {displayed.map((order: any) => (
            <div
              key={order.id}
              onClick={() => router.push(`/admin/ordenes/${order.id}`)}
              style={{ display: "grid", gridTemplateColumns: "1.5fr 1.5fr 1fr 1fr 1fr 1fr", gap: "16px", padding: "14px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", cursor: "pointer" }}
            >
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, color: "#000", margin: 0 }}>{order.order_number}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{order.company_name ?? "—"}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{order.customer_po}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0 }}>{new Date(order.created_at).toLocaleDateString("es-CR")}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 600, color: statusColor[order.status], margin: 0, textTransform: "uppercase", letterSpacing: "0.04em" }}>{statusLabel[order.status]}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>₡{parseFloat(order.subtotal_confirmed ?? order.subtotal_initial).toLocaleString("es-CR")}</p>
            </div>
          ))}
        </>
      )}
    </>
  );
}

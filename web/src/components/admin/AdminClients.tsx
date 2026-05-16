"use client";

import { useEffect, useState } from "react";
import { clientService, ApiClient } from "@/services/clientService";
import { adminProductService, AdminProduct } from "@/services/adminProductService";

export default function AdminClients() {
  const [clients, setClients] = useState<ApiClient[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selectedClient, setSelectedClient] = useState<ApiClient | null>(null);
  const [assignedIds, setAssignedIds] = useState<Set<number>>(new Set());
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  async function loadBase() {
    try {
      const [c, p] = await Promise.all([clientService.getAll(), adminProductService.getAll()]);
      setClients(c);
      setProducts(p);
    } catch { /* */ }
    setFetching(false);
  }

  useEffect(() => { loadBase(); }, []);

  async function selectClient(client: ApiClient) {
    setSelectedClient(client);
    setLoadingAssignment(true);
    try {
      const ids = await clientService.getClientProducts(client.id);
      setAssignedIds(new Set(ids));
    } catch { setAssignedIds(new Set()); }
    setLoadingAssignment(false);
  }

  async function toggleProduct(productId: number) {
    if (!selectedClient) return;
    try {
      if (assignedIds.has(productId)) {
        await clientService.unassignProduct(selectedClient.id, productId);
        setAssignedIds((s) => { const n = new Set(s); n.delete(productId); return n; });
      } else {
        await clientService.assignProduct(selectedClient.id, productId);
        setAssignedIds((s) => new Set(s).add(productId));
      }
    } catch { /* */ }
  }

  async function assignAll() {
    if (!selectedClient || !confirm("¿Asignar TODOS los productos a este cliente?")) return;
    setLoadingAssignment(true);
    try {
      await clientService.assignAll(selectedClient.id);
      setAssignedIds(new Set(products.map((p) => p.id)));
    } catch { /* */ }
    setLoadingAssignment(false);
  }

  async function unassignAll() {
    if (!selectedClient || !confirm("¿Quitar TODOS los productos de este cliente?")) return;
    setLoadingAssignment(true);
    try {
      await clientService.unassignAll(selectedClient.id);
      setAssignedIds(new Set());
    } catch { /* */ }
    setLoadingAssignment(false);
  }

  if (fetching) return <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>;

  return (
    <>
      <h2 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, margin: "0 0 24px 0" }}>
        Asignación de Productos a Clientes
      </h2>

      <div className="adm-clients-layout">
        <style>{`
          .adm-clients-layout { display: grid; grid-template-columns: 1fr; gap: 24px; min-height: 500px; }
          @media (min-width: 1024px) { .adm-clients-layout { grid-template-columns: 280px 1fr; gap: 32px; } }
          .adm-client-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; min-width: 0; }
          .adm-client-table { min-width: 640px; }
        `}</style>

        {/* Left: Client list */}
        <div style={{ borderRight: "1px solid rgba(0,0,0,0.08)", paddingRight: "24px" }}>
          <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", margin: "0 0 12px 0" }}>
            Clientes ({clients.length})
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {clients.map((c) => (
              <button
                key={c.id}
                onClick={() => selectClient(c)}
                style={{
                  display: "flex", flexDirection: "column", gap: "2px",
                  padding: "12px 14px", textAlign: "left",
                  fontFamily: "StyreneA, sans-serif", fontSize: "13px",
                  color: selectedClient?.id === c.id ? "#000" : "rgba(0,0,0,0.6)",
                  fontWeight: selectedClient?.id === c.id ? 500 : 400,
                  background: selectedClient?.id === c.id ? "rgba(0,0,0,0.04)" : "transparent",
                  border: "none", cursor: "pointer", width: "100%",
                  borderLeft: selectedClient?.id === c.id ? "2px solid #000" : "2px solid transparent",
                }}
              >
                <span>{c.company_name}</span>
                <span style={{ fontSize: "11px", color: "rgba(0,0,0,0.35)" }}>{c.contact_name} · {c.email}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Product assignment */}
        <div>
          {!selectedClient ? (
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.3)", padding: "60px 0", textAlign: "center" }}>
              Seleccioná un cliente para ver y asignar productos.
            </p>
          ) : loadingAssignment ? (
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando asignaciones...</p>
          ) : (
            <>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "15px", fontWeight: 500, color: "#000", margin: "0 0 4px 0" }}>
                    {selectedClient.company_name}
                  </p>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.45)", margin: 0 }}>
                    {assignedIds.size} de {products.length} productos asignados
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={assignAll} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#fff", backgroundColor: "#3a6b3a", border: "none", padding: "7px 14px", cursor: "pointer" }}>Asignar Todos</button>
                  <button onClick={unassignAll} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#fff", backgroundColor: "#9c0f0f", border: "none", padding: "7px 14px", cursor: "pointer" }}>Quitar Todos</button>
                </div>
              </div>

              {/* Product table - wrapped for horizontal scroll on mobile */}
              <div className="adm-client-table-wrap"><div className="adm-client-table">
              <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1.5fr 1fr 0.8fr", gap: "12px", padding: "0 0 10px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                {["", "SKU", "Nombre", "Categoría", "Estado"].map((h) => (
                  <p key={h || "check"} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", margin: 0 }}>{h}</p>
                ))}
              </div>
              {products.map((p) => (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1.5fr 1fr 0.8fr", gap: "12px", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", alignItems: "center" }}>
                  <input
                    type="checkbox"
                    checked={assignedIds.has(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    style={{ cursor: "pointer", width: "16px", height: "16px" }}
                  />
                  <p style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(0,0,0,0.6)", margin: 0 }}>{p.sku}</p>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>{p.name}</p>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.6)", margin: 0 }}>{p.category}</p>
                  <span style={{
                    fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600,
                    color: assignedIds.has(p.id) ? "#3a6b3a" : "rgba(0,0,0,0.3)",
                  }}>
                    {assignedIds.has(p.id) ? "Asignado" : "—"}
                  </span>
                </div>
              ))}
              </div></div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import { siblingService, SiblingGroup } from "@/services/siblingService";
import { adminProductService, AdminProduct } from "@/services/adminProductService";

export default function AdminSiblings() {
  const [groups, setGroups] = useState<SiblingGroup[]>([]);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [fetching, setFetching] = useState(true);

  // Create/edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SiblingGroup | null>(null);
  const [formName, setFormName] = useState("");
  const [formProductIds, setFormProductIds] = useState<Set<number>>(new Set());
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  async function load() {
    try {
      const [g, p] = await Promise.all([siblingService.getGroups(), adminProductService.getAll()]);
      setGroups(g);
      setProducts(p);
    } catch { /* */ }
    setFetching(false);
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingGroup(null);
    setFormName("");
    setFormProductIds(new Set());
    setSearch("");
    setModalOpen(true);
  }

  function openEdit(g: SiblingGroup) {
    setEditingGroup(g);
    setFormName(g.name);
    setFormProductIds(new Set(g.products.map((p) => p.product_id)));
    setSearch("");
    setModalOpen(true);
  }

  async function handleSave() {
    if (!formName.trim() || formProductIds.size < 2) return;
    setSaving(true);
    try {
      if (editingGroup) {
        await siblingService.updateGroup(editingGroup.id, formName.trim(), Array.from(formProductIds));
      } else {
        await siblingService.createGroup(formName.trim(), Array.from(formProductIds));
      }
      setModalOpen(false);
      await load();
    } catch { /* */ }
    setSaving(false);
  }

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este grupo de variantes?")) return;
    try { await siblingService.deleteGroup(id); await load(); } catch { /* */ }
  }

  function toggleProduct(id: number) {
    setFormProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  // Productos que ya están en OTRO grupo (no se pueden reasignar)
  const usedProductIds = new Set(
    groups
      .filter((g) => g.id !== editingGroup?.id)
      .flatMap((g) => g.products.map((p) => p.product_id))
  );

  const filteredProducts = products.filter((p) => {
    if (usedProductIds.has(p.id) && !formProductIds.has(p.id)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
  });

  const inputStyle: React.CSSProperties = {
    fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)",
    padding: "9px 12px", outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, margin: 0 }}>
          Variantes de Color <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.35)" }}>({groups.length} grupos)</span>
        </h2>
        <button onClick={openCreate} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#fff", backgroundColor: "#000", border: "none", padding: "9px 20px", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          + Nuevo Grupo
        </button>
      </div>

      {fetching ? (
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
      ) : groups.length === 0 ? (
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", padding: "40px 0" }}>No hay grupos de variantes.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {groups.map((g) => (
            <div key={g.id} style={{ border: "1px solid rgba(0,0,0,0.1)", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", fontWeight: 500, color: "#000", margin: 0 }}>{g.name}</p>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(g)} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "5px 12px", cursor: "pointer" }}>Editar</button>
                  <button onClick={() => handleDelete(g.id)} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#9c0f0f", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "5px 12px", cursor: "pointer" }}>Eliminar</button>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {g.products.map((p) => (
                  <div key={p.product_id} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 12px", backgroundColor: "#f5f4f4", borderRadius: "4px" }}>
                    {p.image && <img src={p.image} alt="" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "2px" }} />}
                    <span style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#000" }}>{p.name}</span>
                    {p.color && <span style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", color: "rgba(0,0,0,0.4)" }}>({p.color})</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear/editar grupo */}
      {modalOpen && (
        <>
          <div onClick={() => setModalOpen(false)} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 200 }} />
          <div style={{ position: "fixed", top: "5%", left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", width: "560px", maxHeight: "90vh", overflowY: "auto", zIndex: 201, padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "16px", fontWeight: 400, margin: 0 }}>
                {editingGroup ? `Editar: ${editingGroup.name}` : "Nuevo Grupo de Variantes"}
              </h3>
              <button onClick={() => setModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "18px", color: "rgba(0,0,0,0.4)" }}>×</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", margin: "0 0 4px 0" }}>Nombre del grupo</p>
                <input style={inputStyle} value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="ej. Camisa Columbia Hombre" />
              </div>

              <div>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", margin: "0 0 4px 0" }}>
                  Productos en este grupo ({formProductIds.size} seleccionados)
                </p>
                <input style={{ ...inputStyle, marginBottom: "10px" }} placeholder="Buscar producto..." value={search} onChange={(e) => setSearch(e.target.value)} />
                <div style={{ maxHeight: "320px", overflowY: "auto", border: "1px solid rgba(0,0,0,0.1)" }}>
                  {filteredProducts.map((p) => (
                    <label
                      key={p.id}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "8px 12px", cursor: "pointer",
                        backgroundColor: formProductIds.has(p.id) ? "rgba(0,0,0,0.03)" : "transparent",
                        borderBottom: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <input type="checkbox" checked={formProductIds.has(p.id)} onChange={() => toggleProduct(p.id)} style={{ cursor: "pointer" }} />
                      {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "2px", backgroundColor: "#f5f4f4" }} />}
                      <span style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#000", flex: 1 }}>{p.name}</span>
                      <span style={{ fontFamily: "monospace", fontSize: "10px", color: "rgba(0,0,0,0.4)" }}>{p.sku}</span>
                    </label>
                  ))}
                </div>
              </div>

              {formProductIds.size < 2 && (
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: 0 }}>Seleccioná al menos 2 productos para crear un grupo.</p>
              )}

              <button
                onClick={handleSave}
                disabled={saving || formProductIds.size < 2 || !formName.trim()}
                style={{
                  fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500,
                  color: "#fff", backgroundColor: saving || formProductIds.size < 2 ? "rgba(0,0,0,0.3)" : "#000",
                  border: "none", padding: "12px", cursor: saving || formProductIds.size < 2 ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Guardando..." : editingGroup ? "Guardar Cambios" : "Crear Grupo"}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { adminProductService, AdminProduct, ProductPayload } from "@/services/adminProductService";
import { uploadService } from "@/services/uploadService";

export default function AdminProducts() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState("");
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);
  const [isCreate, setIsCreate] = useState(false);

  async function load() {
    try { setProducts(await adminProductService.getAll()); } catch { /* */ }
    setFetching(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  async function handleDelete(id: number) {
    if (!confirm("¿Eliminar este producto?")) return;
    try { await adminProductService.delete(id); await load(); } catch { alert("Error al eliminar."); }
  }

  async function handleEdit(id: number) {
    try {
      const full = await adminProductService.getById(id);
      setEditProduct(full);
      setIsCreate(false);
    } catch { alert("Error al cargar producto."); }
  }

  function handleCreate() {
    setEditProduct({
      id: 0, sku: "", name: "", description: "", category: "", reference_price: "0",
      active: true, colors: [], sizes: [], images: [], videos: [], variants: [],
    });
    setIsCreate(true);
  }

  async function handleSave(payload: ProductPayload) {
    if (isCreate) {
      await adminProductService.create(payload);
    } else if (editProduct) {
      await adminProductService.update(editProduct.id, payload);
    }
    setEditProduct(null);
    await load();
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)",
    padding: "9px 12px", outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, margin: 0 }}>
          Productos <span style={{ fontSize: "13px", color: "rgba(0,0,0,0.35)" }}>({products.length})</span>
        </h2>
        <button onClick={handleCreate} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#fff", backgroundColor: "#000", border: "none", padding: "9px 20px", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" }}>
          + Nuevo Producto
        </button>
      </div>

      <input type="text" placeholder="Buscar por nombre, SKU o categoría..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ ...inputStyle, marginBottom: "20px", maxWidth: "400px" }} />

      {fetching ? (
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "0.5fr 1fr 2fr 1fr 1fr 0.8fr 1.2fr", gap: "12px", padding: "0 0 10px 0", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
            {["ID", "SKU", "Nombre", "Categoría", "Precio", "Variantes", "Acciones"].map((h) => (
              <p key={h} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.35)", margin: 0 }}>{h}</p>
            ))}
          </div>
          {filtered.map((p) => (
            <div key={p.id} style={{ display: "grid", gridTemplateColumns: "0.5fr 1fr 2fr 1fr 1fr 0.8fr 1.2fr", gap: "12px", padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,0.06)", alignItems: "center" }}>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)", margin: 0 }}>{p.id}</p>
              <p style={{ fontFamily: "monospace", fontSize: "12px", color: "rgba(0,0,0,0.6)", margin: 0 }}>{p.sku}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {p.images?.[0] && <img src={p.images[0]} alt="" style={{ width: "32px", height: "32px", objectFit: "contain", borderRadius: "4px", backgroundColor: "#f5f4f4" }} />}
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", margin: 0 }}>{p.name}</p>
              </div>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.6)", margin: 0 }}>{p.category}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#000", margin: 0 }}>₡{parseFloat(p.reference_price).toLocaleString("es-CR")}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)", margin: 0 }}>{p.variants?.length ?? 0}</p>
              <div style={{ display: "flex", gap: "6px" }}>
                <button onClick={() => handleEdit(p.id)} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "5px 10px", cursor: "pointer" }}>Editar</button>
                <button onClick={() => handleDelete(p.id)} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#9c0f0f", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "5px 10px", cursor: "pointer" }}>Eliminar</button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* Product Edit Modal */}
      {editProduct && (
        <ProductEditModal
          product={editProduct}
          isCreate={isCreate}
          onClose={() => setEditProduct(null)}
          onSave={handleSave}
        />
      )}
    </>
  );
}

/* ═══════════════════════════════════════════════════════
   Product Edit Modal
   ═══════════════════════════════════════════════════════ */
function ProductEditModal({ product, isCreate, onClose, onSave }: {
  product: AdminProduct;
  isCreate: boolean;
  onClose: () => void;
  onSave: (payload: ProductPayload) => Promise<void>;
}) {
  const [form, setForm] = useState({
    sku: product.sku, name: product.name, description: product.description || "",
    category: product.category, reference_price: product.reference_price || "0",
    active: product.active ?? true,
    colors: (product.colors ?? []).join(", "),
    sizes: (product.sizes ?? []).join(", "),
  });
  const [existingImages, setExistingImages] = useState<string[]>(product.images ?? []);
  const [existingVideos, setExistingVideos] = useState<string[]>(product.videos ?? []);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newVideoFiles, setNewVideoFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [error, setError] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  function set(key: string, value: string | boolean) { setForm((f) => ({ ...f, [key]: value })); }

  async function handleSubmit() {
    if (!form.sku || !form.name || !form.category) { setError("SKU, Nombre y Categoría son requeridos."); return; }
    setSaving(true);
    setError("");

    try {
      let uploadedImages: string[] = [];
      let uploadedVideos: string[] = [];

      if (newImageFiles.length > 0) {
        setUploadStatus("Subiendo imágenes...");
        const res = await uploadService.uploadImages(newImageFiles);
        uploadedImages = res.map((r) => r.url);
      }
      if (newVideoFiles.length > 0) {
        setUploadStatus("Subiendo videos...");
        const res = await uploadService.uploadVideos(newVideoFiles);
        uploadedVideos = res.map((r) => r.url);
      }

      const allImages = [...existingImages, ...uploadedImages];
      const allVideos = [...existingVideos, ...uploadedVideos];
      const colors = form.colors.split(",").map((c) => c.trim()).filter(Boolean);
      const sizes = form.sizes.split(",").map((s) => s.trim()).filter(Boolean);

      const payload: ProductPayload = {
        sku: form.sku,
        name: form.name,
        description: form.description,
        category: form.category,
        reference_price: parseFloat(form.reference_price) || 0,
        active: form.active,
        colors,
        sizes,
        images: allImages,
        videos: allVideos,
      };

      setUploadStatus("Guardando producto...");
      await onSave(payload);
    } catch (e: any) {
      setError(e?.error || "Error al guardar.");
    }
    setSaving(false);
    setUploadStatus("");
  }

  const inputStyle: React.CSSProperties = {
    fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)",
    padding: "9px 12px", outline: "none", width: "100%", boxSizing: "border-box",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "StyreneA, sans-serif", fontSize: "10px", fontWeight: 600,
    letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)", margin: "0 0 4px 0",
  };

  const categories = ["UNIFORME", "ZAPATOS DE SEGURIDAD", "MOTOCICLETA", "SEGURIDAD", "PROTECCION", "HIGIENE", "PROMOCIONAL"];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 200 }} />
      <div style={{ position: "fixed", top: "3%", left: "50%", transform: "translateX(-50%)", backgroundColor: "#fff", width: "680px", maxHeight: "94vh", overflowY: "auto", zIndex: 201, padding: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "18px", fontWeight: 400, margin: 0 }}>
            {isCreate ? "Nuevo Producto" : `Editar: ${product.name}`}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "rgba(0,0,0,0.4)" }}>×</button>
        </div>

        {uploadStatus && (
          <div style={{ backgroundColor: "#f0f4ff", padding: "10px 16px", marginBottom: "16px", fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#0369a1" }}>
            {uploadStatus}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Basic info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
            <div><p style={labelStyle}>SKU *</p><input style={inputStyle} value={form.sku} onChange={(e) => set("sku", e.target.value)} /></div>
            <div>
              <p style={labelStyle}>Categoría *</p>
              <select style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div><p style={labelStyle}>Nombre *</p><input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} /></div>
          <div><p style={labelStyle}>Descripción</p><textarea style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" }}>
            <div><p style={labelStyle}>Precio Referencia</p><input type="number" style={inputStyle} value={form.reference_price} onChange={(e) => set("reference_price", e.target.value)} /></div>
            <div><p style={labelStyle}>Colores (separados por coma)</p><input style={inputStyle} value={form.colors} onChange={(e) => set("colors", e.target.value)} /></div>
            <div><p style={labelStyle}>Tallas (separados por coma)</p><input style={inputStyle} value={form.sizes} onChange={(e) => set("sizes", e.target.value)} /></div>
          </div>

          {/* Existing images */}
          {existingImages.length > 0 && (
            <div>
              <p style={labelStyle}>Imágenes actuales</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {existingImages.map((url, i) => (
                  <div key={i} style={{ position: "relative", width: "80px", height: "80px", backgroundColor: "#f5f4f4", borderRadius: "4px", overflow: "hidden" }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                    <button
                      onClick={() => setExistingImages((imgs) => imgs.filter((_, j) => j !== i))}
                      style={{ position: "absolute", top: "2px", right: "2px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", fontSize: "10px", color: "#9c0f0f", lineHeight: "18px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload images */}
          <div>
            <p style={labelStyle}>Subir imágenes nuevas</p>
            <input ref={imgRef} type="file" accept="image/*" multiple onChange={(e) => setNewImageFiles([...newImageFiles, ...Array.from(e.target.files ?? [])])} style={{ display: "none" }} />
            <button onClick={() => imgRef.current?.click()} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#000", border: "1px dashed rgba(0,0,0,0.3)", background: "none", padding: "12px 20px", cursor: "pointer", width: "100%" }}>
              Seleccionar imágenes ({newImageFiles.length} seleccionadas)
            </button>
          </div>

          {/* Existing videos */}
          {existingVideos.length > 0 && (
            <div>
              <p style={labelStyle}>Videos actuales ({existingVideos.length})</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {existingVideos.map((url, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <video src={url} style={{ width: "120px", height: "80px", objectFit: "cover", borderRadius: "4px", backgroundColor: "#000" }} />
                    <button
                      onClick={() => setExistingVideos((vids) => vids.filter((_, j) => j !== i))}
                      style={{ position: "absolute", top: "2px", right: "2px", width: "18px", height: "18px", borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", fontSize: "10px", color: "#9c0f0f", lineHeight: "18px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.2)" }}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upload videos */}
          <div>
            <p style={labelStyle}>Subir videos nuevos</p>
            <input ref={vidRef} type="file" accept="video/*" multiple onChange={(e) => setNewVideoFiles([...newVideoFiles, ...Array.from(e.target.files ?? [])])} style={{ display: "none" }} />
            <button onClick={() => vidRef.current?.click()} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#000", border: "1px dashed rgba(0,0,0,0.3)", background: "none", padding: "12px 20px", cursor: "pointer", width: "100%" }}>
              Seleccionar videos ({newVideoFiles.length} seleccionados)
            </button>
          </div>

          {/* Active */}
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={form.active} onChange={(e) => set("active", e.target.checked)} />
            <span style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px" }}>Producto activo</span>
          </label>

          {error && <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#9c0f0f", margin: 0 }}>{error}</p>}

          <button onClick={handleSubmit} disabled={saving} style={{
            fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500,
            color: "#fff", backgroundColor: saving ? "rgba(0,0,0,0.4)" : "#000",
            border: "none", padding: "14px", cursor: saving ? "not-allowed" : "pointer",
            letterSpacing: "0.04em", textTransform: "uppercase",
          }}>
            {saving ? "Guardando..." : isCreate ? "Crear Producto" : "Guardar Cambios"}
          </button>
        </div>
      </div>
    </>
  );
}

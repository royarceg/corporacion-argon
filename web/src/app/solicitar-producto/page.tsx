"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { animate } from "animejs";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { uploadService } from "@/services/uploadService";
import api from "@/services/api";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SolicitarProductoPage() {
  const { isAuthenticated, loading } = useRequireAuth();
  const router = useRouter();
  const formRef = useRef<HTMLDivElement>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && formRef.current) {
      animate(formRef.current, { opacity: [0, 1], translateY: [20, 0], duration: 600, ease: "outExpo" });
    }
  }, [loading]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) { setError("El nombre del producto es requerido."); return; }
    if (!description.trim()) { setError("La descripción es requerida."); return; }

    setSubmitting(true);
    setError("");

    try {
      let image_url: string | undefined;
      if (imageFile) {
        const uploaded = await uploadService.uploadImages([imageFile]);
        image_url = uploaded[0]?.url;
      }

      await api.post("/product-requests", { title: title.trim(), description: description.trim(), image_url });
      setSubmitted(true);
    } catch {
      setError("Error al enviar la solicitud. Intentá de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  const inputStyle: React.CSSProperties = {
    fontFamily: "StyreneA, sans-serif", fontSize: "13px", border: "1px solid rgba(0,0,0,0.2)",
    padding: "12px 14px", outline: "none", width: "100%", boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "clamp(28px, 5vw, 48px) clamp(16px, 4vw, 40px) clamp(40px, 8vw, 80px)", flex: 1, display: "flex", justifyContent: "center" }}>
        <div ref={formRef} style={{ width: "100%", maxWidth: "560px", opacity: 0 }}>

          {submitted ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>✓</div>
              <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "24px", fontWeight: 400, color: "#000", margin: "0 0 12px 0" }}>
                Solicitud enviada
              </h1>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.5)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                Nuestro equipo revisará tu solicitud y te contactaremos pronto.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <button
                  onClick={() => { setSubmitted(false); setTitle(""); setDescription(""); setImageFile(null); setImagePreview(null); }}
                  style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#000", border: "1px solid rgba(0,0,0,0.2)", background: "none", padding: "10px 20px", cursor: "pointer", letterSpacing: "0.04em", textTransform: "uppercase" }}
                >
                  Enviar otra
                </button>
                <a href="/productos" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#fff", backgroundColor: "#000", textDecoration: "none", padding: "10px 20px", letterSpacing: "0.04em", textTransform: "uppercase", display: "inline-flex", alignItems: "center" }}>
                  Ver catálogo
                </a>
              </div>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "24px", fontWeight: 400, color: "#000", margin: "0 0 8px 0", letterSpacing: "-0.01em" }}>
                Solicitar un Producto
              </h1>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.45)", margin: "0 0 36px 0", lineHeight: 1.6 }}>
                ¿No encontrás lo que buscás? Describí el producto que necesitás y nuestro equipo te contactará con opciones.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {/* Nombre del producto */}
                <div>
                  <label style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#000", display: "block", marginBottom: "6px" }}>
                    Nombre del producto *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ej: Casco de seguridad con visor"
                    style={inputStyle}
                  />
                </div>

                {/* Descripción */}
                <div>
                  <label style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#000", display: "block", marginBottom: "6px" }}>
                    Descripción detallada *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describí qué necesitás: color, talla, cantidad estimada, material, uso, referencia de otra marca..."
                    rows={5}
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
                  />
                </div>

                {/* Imagen de referencia */}
                <div>
                  <label style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", color: "#000", display: "block", marginBottom: "6px" }}>
                    Imagen de referencia (opcional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                    id="request-image"
                  />
                  <label
                    htmlFor="request-image"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      border: "1px dashed rgba(0,0,0,0.25)", padding: "16px",
                      cursor: "pointer", fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.5)",
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    {imageFile ? imageFile.name : "Seleccionar imagen"}
                  </label>
                  {imagePreview && (
                    <div style={{ marginTop: "12px", position: "relative", display: "inline-block" }}>
                      <img src={imagePreview} alt="Preview" style={{ maxWidth: "200px", maxHeight: "160px", objectFit: "contain", borderRadius: "4px", border: "1px solid rgba(0,0,0,0.1)" }} />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(null); }}
                        style={{ position: "absolute", top: "-8px", right: "-8px", width: "20px", height: "20px", borderRadius: "50%", background: "#000", color: "#fff", border: "none", cursor: "pointer", fontSize: "11px", lineHeight: "20px", textAlign: "center" }}
                      >×</button>
                    </div>
                  )}
                </div>

                {error && (
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#9c0f0f", margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500,
                    color: "#fff", backgroundColor: submitting ? "rgba(0,0,0,0.4)" : "#000",
                    border: "none", padding: "14px", cursor: submitting ? "not-allowed" : "pointer",
                    letterSpacing: "0.06em", textTransform: "uppercase",
                  }}
                >
                  {submitting ? "Enviando..." : "Enviar Solicitud"}
                </button>
              </form>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

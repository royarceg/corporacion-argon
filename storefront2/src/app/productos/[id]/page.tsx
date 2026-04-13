"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { productService, ApiProductDetail, ApiVariant } from "@/services/productService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>("descripcion");

  useEffect(() => {
    if (!loading && !isAuthenticated()) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      productService.getProductById(Number(id))
        .then((p) => {
          setProduct(p);
          setSelectedColor(p.colors?.[0] ?? null);
        })
        .catch(() => router.replace("/productos"))
        .finally(() => setFetching(false));
    }
  }, [id, loading, isAuthenticated, router]);

  function resolveVariant(): ApiVariant | null {
    if (!product?.variants?.length) return null;
    return product.variants.find(
      (v) =>
        (selectedSize ? v.size === selectedSize : true) &&
        (selectedColor ? v.color === selectedColor : true)
    ) ?? null;
  }

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    try {
      const variant = resolveVariant();
      await addToCart(product.id, qty, variant?.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  }

  if (loading || fetching || !product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
          Cargando...
        </p>
      </div>
    );
  }

  const price = parseFloat(product.price).toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  });
  const colors = product.colors ?? [];
  const sizes = sortSizes(product.sizes ?? []);
  const images = product.images ?? [];
  const activeVariant = resolveVariant();

  const accordions = [
    {
      key: "descripcion",
      label: "Descripción",
      content: product.description || "Sin descripción.",
    },
    {
      key: "detalles",
      label: "Detalles del producto",
      content: `Categoría: ${product.category}\nSKU base: ${product.sku}`,
    },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "40px 40px 80px", flex: 1 }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 400px",
          gap: "60px",
          alignItems: "start",
        }}>

          {/* ── LEFT: imágenes apiladas ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {images.length > 0 ? images.map((img, i) => (
              <div
                key={i}
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  backgroundColor: "#f5f4f4",
                  overflow: "hidden",
                }}
              >
                <img
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            )) : (
              <div style={{ width: "100%", aspectRatio: "3/4", backgroundColor: "#f5f4f4" }} />
            )}
          </div>

          {/* ── RIGHT: panel sticky ── */}
          <div style={{ position: "sticky", top: "32px", display: "flex", flexDirection: "column", gap: "0" }}>

            {/* Breadcrumb */}
            <p style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "11px",
              color: "rgba(0,0,0,0.4)",
              margin: "0 0 20px 0",
              letterSpacing: "0.02em",
            }}>
              <button
                onClick={() => router.back()}
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "11px",
                  color: "rgba(0,0,0,0.4)",
                  letterSpacing: "0.02em",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ← Catálogo
              </button>
              {" / "}
              <span style={{ textTransform: "capitalize" }}>{product.category?.toLowerCase()}</span>
            </p>

            {/* Name */}
            <h1 style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#000",
              margin: "0 0 10px 0",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <p style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              color: "#000",
              margin: "0 0 24px 0",
            }}>
              {price}
            </p>

            {/* Color */}
            {colors.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#000",
                  margin: "0 0 10px 0",
                }}>
                  Color: <span style={{ fontWeight: 400 }}>{selectedColor}</span>
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      title={color}
                      onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: colorToHex(color),
                        border: selectedColor === color ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        padding: 0,
                        outline: "none",
                        transition: "border 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                  <p style={{
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#000",
                    margin: 0,
                  }}>
                    Talla:
                  </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize((prev) => prev === size ? null : size)}
                      style={{
                        fontFamily: "Graphik, sans-serif",
                        fontSize: "12px",
                        color: selectedSize === size ? "#fff" : "#000",
                        backgroundColor: selectedSize === size ? "#000" : "#fff",
                        border: "1px solid rgba(0,0,0,0.25)",
                        padding: "7px 14px",
                        cursor: "pointer",
                        minWidth: "44px",
                        textAlign: "center",
                        transition: "all 0.1s ease",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Variant code */}
                {activeVariant?.sku_variant && (
                  <p style={{
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "11px",
                    color: "rgba(0,0,0,0.45)",
                    margin: "10px 0 0 0",
                    letterSpacing: "0.03em",
                  }}>
                    Código:{" "}
                    <span style={{ color: "#000", fontWeight: 500 }}>
                      {activeVariant.sku_variant}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#000",
                margin: "0 0 10px 0",
              }}>
                Cantidad
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0", border: "1px solid rgba(0,0,0,0.2)", width: "fit-content" }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", minWidth: "32px", textAlign: "center", borderLeft: "1px solid rgba(0,0,0,0.2)", borderRight: "1px solid rgba(0,0,0,0.2)", height: "36px", lineHeight: "36px" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{ width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                backgroundColor: added ? "#3a6b3a" : adding ? "rgba(0,0,0,0.4)" : "#000",
                border: "none",
                padding: "15px",
                cursor: adding ? "not-allowed" : "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "background-color 0.2s",
                marginBottom: "24px",
              }}
            >
              {added ? "✓ Agregado al carrito" : adding ? "Agregando..." : "Agregar al carrito"}
            </button>

            {/* Accordions */}
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              {accordions.map((item) => (
                <div key={item.key} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  <button
                    onClick={() => setOpenAccordion((prev) => prev === item.key ? null : item.key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "Graphik, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#000",
                      textAlign: "left",
                    }}
                  >
                    {item.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="1.5"
                      style={{
                        transform: openAccordion === item.key ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openAccordion === item.key && (
                    <div style={{ paddingBottom: "16px" }}>
                      {item.content.split("\n").map((line, i) => (
                        <p key={i} style={{
                          fontFamily: "Graphik, sans-serif",
                          fontSize: "13px",
                          color: "rgba(0,0,0,0.65)",
                          margin: i === 0 ? 0 : "6px 0 0 0",
                          lineHeight: 1.65,
                        }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

const SIZE_ORDER = ["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

function sortSizes(sizes: string[]): string[] {
  const allNumeric = sizes.every((s) => !isNaN(Number(s)));
  if (allNumeric) return [...sizes].sort((a, b) => Number(a) - Number(b));
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    NEGRO: "#1a1a1a",
    BEIGE: "#d4b896",
    "BEIGE-KHAKI": "#c8b88a",
    BLANCO: "#f5f5f5",
    GRIS: "#9e9e9e",
    AZUL: "#2d6a9f",
    "AZUL OSCURO": "#1a3a5c",
    ROJO: "#9c2121",
    VERDE: "#3a6b3a",
    "VERDE OSCURO": "#2a4a2a",
    NARANJA: "#d4612a",
    AMARILLO: "#d4c12a",
    "AMARILLO FOSFORESCENTE": "#e8e020",
    CAFE: "#7a5c3a",
    MARRON: "#7a5c3a",
  };
  return map[color.toUpperCase()] ?? "#cccccc";
}

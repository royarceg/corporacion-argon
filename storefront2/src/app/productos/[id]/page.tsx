"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { productService, ApiProductDetail } from "@/services/productService";
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
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated()) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      productService.getProductById(Number(id))
        .then((p) => { setProduct(p); setSelectedColor(p.colors?.[0] ?? null); })
        .catch(() => router.replace("/productos"))
        .finally(() => setFetching(false));
    }
  }, [id, loading, isAuthenticated, router]);

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally {
      setAdding(false);
    }
  }

  if (loading || fetching || !product) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
      </div>
    );
  }

  const price = parseFloat(product.price).toLocaleString("es-CR", { style: "currency", currency: "CRC", minimumFractionDigits: 0 });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "40px 32px", flex: 1 }}>

        {/* Breadcrumb */}
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)", margin: "0 0 32px 0" }}>
          <a href="/productos" style={{ color: "inherit", textDecoration: "none" }}>Catálogo</a>
          {" / "}
          {product.category}
          {" / "}
          {product.name}
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 440px", gap: "60px" }}>

          {/* LEFT — Images */}
          <div style={{ display: "flex", gap: "16px" }}>
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "72px" }}>
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    style={{
                      width: "72px",
                      height: "88px",
                      backgroundColor: "#f5f4f4",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: selectedImage === i ? "1px solid #000" : "1px solid transparent",
                    }}
                  >
                    <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                ))}
              </div>
            )}

            {/* Main image */}
            <div style={{ flex: 1, backgroundColor: "#f5f4f4", aspectRatio: "3/4", overflow: "hidden" }}>
              {product.images[selectedImage] && (
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
          </div>

          {/* RIGHT — Info */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingTop: "8px" }}>
            <div>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", margin: "0 0 8px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                {product.sku}
              </p>
              <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "22px", fontWeight: 400, color: "#000", margin: "0 0 12px 0", letterSpacing: "-0.01em", lineHeight: 1.3 }}>
                {product.name}
              </h1>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "18px", fontWeight: 400, color: "#000", margin: 0 }}>
                {price}
              </p>
            </div>

            {/* Color */}
            {product.colors.length > 0 && (
              <div>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px 0" }}>
                  Color: <span style={{ fontWeight: 400 }}>{selectedColor}</span>
                </p>
                <div style={{ display: "flex", gap: "8px" }}>
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      title={color}
                      onClick={() => setSelectedColor(color)}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: colorToHex(color),
                        border: selectedColor === color ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
              <div>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px 0" }}>Talla</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        fontFamily: "Graphik, sans-serif",
                        fontSize: "13px",
                        color: selectedSize === size ? "#fff" : "#000",
                        backgroundColor: selectedSize === size ? "#000" : "#fff",
                        border: "1px solid rgba(0,0,0,0.2)",
                        padding: "6px 14px",
                        cursor: "pointer",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 10px 0" }}>Cantidad</p>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "32px", height: "32px", border: "1px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
                </button>
                <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", minWidth: "24px", textAlign: "center" }}>{qty}</span>
                <button onClick={() => setQty(qty + 1)} style={{ width: "32px", height: "32px", border: "1px solid rgba(0,0,0,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
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
                padding: "16px",
                cursor: adding ? "not-allowed" : "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                transition: "background-color 0.2s",
              }}
            >
              {added ? "✓ Agregado" : adding ? "Agregando..." : "Agregar al carrito"}
            </button>

            {/* Divider */}
            <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.08)" }} />

            {/* Description */}
            <div>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px 0" }}>Descripción</p>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.7)", margin: 0, lineHeight: 1.6 }}>
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    NEGRO: "#1a1a1a", BEIGE: "#d4b896", BLANCO: "#f5f5f5",
    GRIS: "#9e9e9e", AZUL: "#2d6a9f", ROJO: "#9c2121",
    VERDE: "#3a6b3a", NARANJA: "#d4612a", AMARILLO: "#d4c12a",
    CAFE: "#7a5c3a", MARRON: "#7a5c3a",
  };
  return map[color.toUpperCase()] ?? "#cccccc";
}

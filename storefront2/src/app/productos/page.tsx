"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { productService, ApiProduct } from "@/services/productService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";

type SortOption = "featured" | "price-asc" | "price-desc";

export default function ProductosPage() {
  const { isAuthenticated, isClient, loading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [sort, setSort] = useState<SortOption>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activeSizes, setActiveSizes] = useState<string[]>([]);

  // Auth guard
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  // Fetch products
  useEffect(() => {
    if (!loading && isAuthenticated() && isClient()) {
      productService.getProducts()
        .then(setProducts)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [loading, isAuthenticated, isClient]);

  // Unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["Todos", ...cats];
  }, [products]);

  // Unique colors and sizes for filter
  const allColors = useMemo(() =>
    Array.from(new Set(products.flatMap((p) => p.colors))).sort(),
    [products]
  );
  const allSizes = useMemo(() =>
    Array.from(new Set(products.flatMap((p) => p.sizes))).sort(),
    [products]
  );

  // Filtered + sorted products
  const displayed = useMemo(() => {
    let list = products;
    if (activeCategory !== "Todos") list = list.filter((p) => p.category === activeCategory);
    if (activeColors.length) list = list.filter((p) => p.colors.some((c) => activeColors.includes(c)));
    if (activeSizes.length) list = list.filter((p) => p.sizes.some((s) => activeSizes.includes(s)));
    if (sort === "price-asc") list = [...list].sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sort === "price-desc") list = [...list].sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    return list;
  }, [products, activeCategory, activeColors, activeSizes, sort]);

  const sortLabels: Record<SortOption, string> = {
    featured: "Destacados",
    "price-asc": "Precio: menor a mayor",
    "price-desc": "Precio: mayor a menor",
  };

  if (loading || fetching) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
          Cargando productos...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "40px 32px", flex: 1 }}>

        {/* Page title */}
        <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: "0 0 24px 0", letterSpacing: "-0.02em" }}>
          Catálogo
        </h1>

        {/* Filters row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "12px" }}>

          {/* Category pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "12px",
                  fontWeight: 400,
                  color: activeCategory === cat ? "#ffffff" : "#000000",
                  backgroundColor: activeCategory === cat ? "#000000" : "#ffffff",
                  border: "1px solid rgba(0,0,0,0.15)",
                  padding: "6px 16px",
                  cursor: "pointer",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>

            {/* Sort dropdown */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  color: "#000",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: 0,
                }}
              >
                Sort
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {sortOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.08)",
                  minWidth: "200px",
                  zIndex: 50,
                  boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                }}>
                  {(["featured", "price-asc", "price-desc"] as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSort(opt); setSortOpen(false); }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        fontFamily: "Graphik, sans-serif",
                        fontSize: "13px",
                        color: sort === opt ? "#000" : "rgba(0,0,0,0.6)",
                        fontWeight: sort === opt ? 500 : 400,
                        backgroundColor: "transparent",
                        border: "none",
                        padding: "12px 20px",
                        cursor: "pointer",
                      }}
                    >
                      {sortLabels[opt]}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Filter button */}
            <button
              onClick={() => { setFilterOpen(true); setSortOpen(false); }}
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                color: "#000",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Filter
            </button>
          </div>
        </div>

        {/* Product count */}
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "12px", color: "rgba(0,0,0,0.4)", margin: "0 0 24px 0" }}>
          {displayed.length} producto{displayed.length !== 1 ? "s" : ""}
        </p>

        {/* Product grid */}
        {displayed.length === 0 ? (
          <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", padding: "60px 0" }}>
            No hay productos en esta categoría.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px 16px" }}>
            {displayed.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Filter panel */}
      {filterOpen && (
        <>
          <div
            onClick={() => setFilterOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(18,18,18,0.4)", zIndex: 100 }}
          />
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "360px",
            backgroundColor: "#ffffff",
            zIndex: 101,
            padding: "32px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontFamily: "Graphik, sans-serif", fontSize: "16px", fontWeight: 400, margin: 0 }}>Filtros</h2>
              <button onClick={() => setFilterOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Color filter */}
            {allColors.length > 0 && (
              <div>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px 0" }}>Color</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {allColors.map((color) => (
                    <button
                      key={color}
                      title={color}
                      onClick={() => setActiveColors((prev) => prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color])}
                      style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        backgroundColor: colorToHex(color),
                        border: activeColors.includes(color) ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size filter */}
            {allSizes.length > 0 && (
              <div>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", fontWeight: 500, letterSpacing: "0.06em", textTransform: "uppercase", margin: "0 0 12px 0" }}>Talla</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setActiveSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size])}
                      style={{
                        fontFamily: "Graphik, sans-serif",
                        fontSize: "13px",
                        color: activeSizes.includes(size) ? "#000" : "rgba(0,0,0,0.6)",
                        fontWeight: activeSizes.includes(size) ? 500 : 400,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Apply button */}
            <button
              onClick={() => setFilterOpen(false)}
              style={{
                marginTop: "auto",
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: "#000000",
                border: "none",
                padding: "14px",
                cursor: "pointer",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Ver Resultados
            </button>
          </div>
        </>
      )}

      {/* Close sort on outside click */}
      {sortOpen && (
        <div onClick={() => setSortOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
      )}
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

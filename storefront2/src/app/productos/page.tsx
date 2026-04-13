"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { productService, ApiProduct } from "@/services/productService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import QuickViewModal from "@/components/products/QuickViewModal";

type SortOption = "featured" | "best-selling" | "price-asc" | "price-desc";

export default function ProductosPage() {
  return (
    <Suspense>
      <ProductosContent />
    </Suspense>
  );
}

function ProductosContent() {
  const { isAuthenticated, isClient, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [fetching, setFetching] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("featured");
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<ApiProduct | null>(null);

  const searchQuery = searchParams.get("q") ?? "";

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated()) router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated() && isClient()) {
      productService.getProducts()
        .then(setProducts)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [loading, isAuthenticated, isClient]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ["All", ...cats];
  }, [products]);

  const allColors = useMemo(() =>
    Array.from(new Set(products.flatMap((p) => p.colors))).sort(),
    [products]
  );
  const allSizes = useMemo(() =>
    Array.from(new Set(products.flatMap((p) => p.sizes))).sort(),
    [products]
  );

  const displayed = useMemo(() => {
    let list = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.sku ?? "").toLowerCase().includes(q));
    }
    if (activeCategory !== "All") list = list.filter((p) => p.category === activeCategory);
    if (activeColors.length) list = list.filter((p) => p.colors.some((c) => activeColors.includes(c)));
    if (activeSizes.length) list = list.filter((p) => p.sizes.some((s) => activeSizes.includes(s)));
    if (sort === "price-asc") return list.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    if (sort === "price-desc") return list.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    const UNIFORME_ROPA = ["ABRIGO", "CAMISA", "CAPA", "CHALECO", "JACKET", "PANTALON", "SET"];
    const isRopa = (name: string) => UNIFORME_ROPA.some((r) => name.toUpperCase().startsWith(r));

    return list.sort((a, b) => {
      const catA = a.category || "";
      const catB = b.category || "";
      if (catA < catB) return -1;
      if (catA > catB) return 1;
      if (catA === "UNIFORME") {
        const aRopa = isRopa(a.name);
        const bRopa = isRopa(b.name);
        if (aRopa && !bRopa) return -1;
        if (!aRopa && bRopa) return 1;
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [products, searchQuery, activeCategory, activeColors, activeSizes, sort]);

  const sortLabels: Record<SortOption, string> = {
    featured: "Featured",
    "best-selling": "Best selling",
    "price-asc": "Price, low to high",
    "price-desc": "Price, high to low",
  };

  // Count products per size
  const sizeCount = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => p.sizes.forEach((s) => { map[s] = (map[s] ?? 0) + 1; }));
    return map;
  }, [products]);

  if (loading || fetching) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "32px 40px", flex: 1 }}>

        {/* Page title */}
        <h1 style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "24px",
          fontWeight: 400,
          color: "#000",
          margin: "0 0 20px 0",
          letterSpacing: "-0.01em",
        }}>
          {searchQuery.trim() ? `Resultados para "${searchQuery.trim()}"` : "Catálogo"}
        </h1>

        {/* Filters row */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px",
          flexWrap: "wrap",
          gap: "12px",
        }}>

          {/* Category pills */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: activeCategory === cat ? "#ffffff" : "#000000",
                  backgroundColor: activeCategory === cat ? "#000000" : "transparent",
                  border: "1px solid rgba(0,0,0,0.2)",
                  padding: "5px 16px",
                  cursor: "pointer",
                  borderRadius: "100px",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>

            {/* Sort */}
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
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {sortOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.1)",
                  minWidth: "200px",
                  zIndex: 50,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                }}>
                  {(["featured", "best-selling", "price-asc", "price-desc"] as SortOption[]).map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSort(opt); setSortOpen(false); }}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        fontFamily: "Graphik, sans-serif",
                        fontSize: "13px",
                        color: "#000",
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

            {/* Filter */}
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

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", marginBottom: "32px" }} />

        {/* Product grid */}
        {displayed.length === 0 ? (
          <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)", padding: "60px 0" }}>
            {searchQuery.trim() ? `Sin resultados para "${searchQuery.trim()}".` : "No se encontraron productos."}
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px 20px" }}>
            {displayed.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
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
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.3)", zIndex: 100 }}
          />
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: "380px",
            backgroundColor: "#ffffff",
            zIndex: 101,
            padding: "32px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
              <h2 style={{ fontFamily: "Graphik, sans-serif", fontSize: "16px", fontWeight: 400, margin: 0 }}>Filters</h2>
              <button onClick={() => setFilterOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Color */}
            {allColors.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: "0 0 14px 0",
                  color: "#000",
                }}>Color</p>
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
                        outline: "none",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {allSizes.length > 0 && (
              <div style={{ marginBottom: "32px" }}>
                <p style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  margin: "0 0 14px 0",
                  color: "#000",
                }}>Size</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {allSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setActiveSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size])}
                      style={{
                        fontFamily: "Graphik, sans-serif",
                        fontSize: "13px",
                        color: activeSizes.includes(size) ? "#000" : "rgba(0,0,0,0.55)",
                        fontWeight: activeSizes.includes(size) ? 500 : 400,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                        textAlign: "left",
                        display: "flex",
                        gap: "6px",
                      }}
                    >
                      {size}
                      <span style={{ color: "rgba(0,0,0,0.35)", fontWeight: 400 }}>
                        ({sizeCount[size] ?? 0})
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* See Results */}
            <div style={{ marginTop: "auto" }}>
              <button
                onClick={() => setFilterOpen(false)}
                style={{
                  width: "100%",
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  fontWeight: 500,
                  color: "#ffffff",
                  backgroundColor: "#000000",
                  border: "none",
                  padding: "14px",
                  cursor: "pointer",
                  letterSpacing: "0.04em",
                }}
              >
                See Results
              </button>
            </div>
          </div>
        </>
      )}

      {/* Close sort on outside click */}
      {sortOpen && (
        <div onClick={() => setSortOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 49 }} />
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
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

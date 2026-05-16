"use client";

import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useCart } from "@/context/CartContext";
import { wishlistService } from "@/services/wishlistService";
import { ApiProduct } from "@/services/productService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import ProductCard from "@/components/products/ProductCard";

export default function WishlistPage() {
  const { isAuthenticated, loading } = useRequireAuth();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      wishlistService.getWishlist()
        .then((items) => setProducts(items.map((item) => ({
          id: item.product_id,
          sku: item.sku,
          name: item.name,
          category: item.category,
          price: item.price,
          description: "",
          images: item.image_url ? [item.image_url] : [],
          colors: [],
          sizes: [],
        }))))
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [loading, isAuthenticated]);

  async function handleRemove(productId: number) {
    await wishlistService.remove(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  return (
    <div className="page-shell">
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "clamp(28px, 5vw, 48px) clamp(16px, 4vw, 32px)", flex: 1 }}>
        <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "clamp(22px, 4vw, 28px)", fontWeight: 400, color: "#000", margin: "0 0 clamp(28px, 5vw, 48px) 0", letterSpacing: "-0.02em" }}>
          Lista de Deseos
        </h1>

        <div className="wl-layout">
          <style>{`
            .wl-layout { display: flex; flex-direction: column; gap: clamp(24px, 4vw, 80px); align-items: stretch; }
            @media (min-width: 1024px) { .wl-layout { flex-direction: row; align-items: flex-start; } }
            .wl-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(20px, 3vw, 24px) clamp(12px, 2vw, 16px); }
            @media (min-width: 640px) { .wl-grid { grid-template-columns: repeat(3, 1fr); } }
            @media (min-width: 1024px) { .wl-grid { grid-template-columns: repeat(4, 1fr); } }
          `}</style>
          <AccountSidebar />
          <div style={{ flex: 1, minWidth: 0 }}>
            {fetching ? (
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.4)", marginBottom: "20px" }}>Tu lista de deseos está vacía.</p>
                <a href="/productos" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000", textDecoration: "underline" }}>Explorar catálogo</a>
              </div>
            ) : (
              <div className="wl-grid">
                {products.map((product) => (
                  <div key={product.id} style={{ position: "relative" }}>
                    <ProductCard product={product} onAddToCart={(p) => addToCart(p.id, 1)} />
                    <button
                      onClick={() => handleRemove(product.id)}
                      style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", textDecoration: "underline" }}
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

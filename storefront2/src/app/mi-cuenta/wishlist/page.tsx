"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { wishlistService } from "@/services/wishlistService";
import { ApiProduct } from "@/services/productService";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AccountSidebar from "@/components/account/AccountSidebar";
import ProductCard from "@/components/products/ProductCard";

export default function WishlistPage() {
  const { isAuthenticated, loading } = useAuth();
  const { addToCart } = useCart();
  const router = useRouter();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated()) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      wishlistService.getWishlist()
        .then(setProducts)
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [loading, isAuthenticated]);

  async function handleRemove(productId: number) {
    await wishlistService.remove(productId);
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "48px 32px", flex: 1 }}>
        <h1 style={{ fontFamily: "Graphik, sans-serif", fontSize: "28px", fontWeight: 400, color: "#000", margin: "0 0 48px 0", letterSpacing: "-0.02em" }}>
          Lista de Deseos
        </h1>

        <div style={{ display: "flex", gap: "80px", alignItems: "flex-start" }}>
          <AccountSidebar />
          <div style={{ flex: 1 }}>
            {fetching ? (
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>Cargando...</p>
            ) : products.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "14px", color: "rgba(0,0,0,0.4)", marginBottom: "20px" }}>Tu lista de deseos está vacía.</p>
                <a href="/productos" style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "#000", textDecoration: "underline" }}>Explorar catálogo</a>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px 16px" }}>
                {products.map((product) => (
                  <div key={product.id} style={{ position: "relative" }}>
                    <ProductCard product={product} onAddToCart={(p) => addToCart(p.id, 1)} />
                    <button
                      onClick={() => handleRemove(product.id)}
                      style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.4)", background: "none", border: "none", cursor: "pointer", padding: "4px 0", textDecoration: "underline" }}
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

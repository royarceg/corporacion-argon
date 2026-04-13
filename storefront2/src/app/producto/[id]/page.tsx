"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ProductoPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      router.replace("/productos");
    }
  }, [loading, isAuthenticated, router]);

  // Mientras carga la sesión, no mostrar nada
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
          Cargando...
        </p>
      </div>
    );
  }

  // Usuario no autenticado — mostrar pantalla de acceso
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <AnnouncementBar />
      <Header />

      <main
        style={{
          width: "100%",
          maxWidth: "1400px",
          padding: "60px 32px",
          flex: 1,
        }}
      >
        <h1
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "28px",
            fontWeight: 400,
            color: "#000000",
            margin: "0 0 24px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Área Exclusiva para Clientes
        </h1>

        <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.1)", marginBottom: "80px" }} />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 0 120px 0",
            gap: "24px",
            textAlign: "center",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>

          <p
            style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              color: "#000000",
              margin: 0,
              maxWidth: "420px",
              lineHeight: "1.6",
            }}
          >
            Para ver precios y detalles de productos debés ser cliente registrado.
          </p>

          <p
            style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "rgba(0,0,0,0.5)",
              margin: 0,
              maxWidth: "420px",
              lineHeight: "1.6",
            }}
          >
            Creá tu cuenta o iniciá sesión para acceder a nuestro catálogo completo con precios y disponibilidad.
          </p>

          <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <a
              href="/registro"
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: "#000000",
                textDecoration: "none",
                padding: "14px 32px",
                display: "inline-block",
                letterSpacing: "0.04em",
              }}
            >
              Registrarse
            </a>
            <a
              href="/login"
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "13px",
                fontWeight: 400,
                color: "#000000",
                backgroundColor: "#ffffff",
                textDecoration: "none",
                padding: "14px 32px",
                display: "inline-block",
                border: "1px solid #000000",
                letterSpacing: "0.04em",
              }}
            >
              Iniciar Sesión
            </a>
          </div>
        </div>

        <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.1)", marginBottom: "48px" }} />

        <h2
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "14px",
            fontWeight: 400,
            color: "#000000",
            margin: "0 0 32px 0",
            letterSpacing: "0.02em",
          }}
        >
          También te puede interesar
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "16px",
          }}
        >
          {[
            { img: "/images/ai-originals/image/ai-image-13.png", label: "Producto del Catálogo" },
            { img: "/images/ai-originals/image/ai-image-11.png", label: "Producto del Catálogo" },
            { img: "/images/ai-originals/image/ai-image-04.png", label: "Producto del Catálogo" },
            { img: "/images/ai-originals/image/ai-image-01.png", label: "Producto del Catálogo" },
          ].map((item, i) => (
            <div key={i}>
              <div
                style={{
                  aspectRatio: "3/4",
                  width: "100%",
                  marginBottom: "12px",
                  overflow: "hidden",
                  backgroundColor: "#f5f4f4",
                }}
              >
                <img
                  src={item.img}
                  alt={item.label}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, color: "#000000", margin: "0 0 4px 0" }}>
                {item.label}
              </p>
              <p style={{ fontFamily: "Graphik, sans-serif", fontSize: "13px", fontWeight: 400, color: "rgba(0,0,0,0.5)", margin: 0 }}>
                — — —
              </p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { animate } from "animejs";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (formRef.current) {
      animate(formRef.current, {
        opacity: [0, 1],
        translateY: [24, 0],
        duration: 700,
        ease: "outExpo",
      });
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { user } = await login(username, password);
      if (user.role === "master_admin") {
        router.push("/admin");
      } else {
        router.push("/productos");
      }
    } catch {
      setError("Usuario o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <AnnouncementBar />

      {/* Minimal header — solo logo */}
      <header
        style={{
          width: "100%",
          height: "68px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <a
          href="/"
          style={{
            fontFamily: "StyreneA, sans-serif",
            fontSize: "20px",
            fontWeight: 700,
            color: "#000000",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          ARGON.
        </a>
      </header>

      {/* Login form — centered */}
      <main
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 32px",
          backgroundColor: "#f5f4f4",
        }}
      >
        <div
          ref={formRef}
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "#ffffff",
            padding: "48px 40px",
            opacity: 0,
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "22px",
              fontWeight: 400,
              color: "#000000",
              margin: "0 0 8px 0",
              letterSpacing: "-0.02em",
            }}
          >
            Iniciar Sesión
          </h1>
          <p
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "13px",
              color: "rgba(0,0,0,0.5)",
              margin: "0 0 32px 0",
            }}
          >
            Accedé a tu cuenta de cliente en CORPORACION ARGON.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "11px",
                  fontWeight: 500,
                  color: "#000000",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Usuario
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                placeholder="tu_usuario"
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  color: "#000000",
                  backgroundColor: "#ffffff",
                  border: "1px solid rgba(0,0,0,0.2)",
                  padding: "12px 14px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label
                  style={{
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "11px",
                    fontWeight: 500,
                    color: "#000000",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Contraseña
                </label>
                <a
                  href="/recuperar-contrasena"
                  style={{
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "11px",
                    color: "rgba(0,0,0,0.5)",
                    textDecoration: "none",
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  style={{
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "13px",
                    color: "#000000",
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.2)",
                    padding: "12px 40px 12px 14px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    color: "rgba(0,0,0,0.4)",
                  }}
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  color: "#9c0f0f",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#ffffff",
                backgroundColor: loading ? "rgba(0,0,0,0.4)" : "#000000",
                border: "none",
                padding: "14px",
                cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                width: "100%",
                marginTop: "4px",
              }}
            >
              {loading ? "Ingresando..." : "Iniciar Sesión"}
            </button>
          </form>

          {/* Divider */}
          <div
            style={{
              width: "100%",
              height: "1px",
              backgroundColor: "rgba(0,0,0,0.08)",
              margin: "32px 0",
            }}
          />

          {/* Register note */}
          <p
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "13px",
              color: "rgba(0,0,0,0.5)",
              margin: 0,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            ¿No tenés cuenta?{" "}
            <a
              href="/registro"
              style={{ color: "#000000", textDecoration: "underline" }}
            >
              Contactá a CORPORACION ARGON
            </a>{" "}
            para solicitar acceso.
          </p>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
            fontFamily: "Graphik, sans-serif",
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
          style={{
            width: "100%",
            maxWidth: "420px",
            backgroundColor: "#ffffff",
            padding: "48px 40px",
          }}
        >
          {/* Title */}
          <h1
            style={{
              fontFamily: "Graphik, sans-serif",
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
              fontFamily: "Graphik, sans-serif",
              fontSize: "13px",
              color: "rgba(0,0,0,0.5)",
              margin: "0 0 32px 0",
            }}
          >
            Accedé a tu cuenta de cliente ARGON.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label
                style={{
                  fontFamily: "Graphik, sans-serif",
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
                  fontFamily: "Graphik, sans-serif",
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
                    fontFamily: "Graphik, sans-serif",
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
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "11px",
                    color: "rgba(0,0,0,0.5)",
                    textDecoration: "none",
                  }}
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  fontFamily: "Graphik, sans-serif",
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

            {/* Error */}
            {error && (
              <p
                style={{
                  fontFamily: "Graphik, sans-serif",
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
                fontFamily: "Graphik, sans-serif",
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
              fontFamily: "Graphik, sans-serif",
              fontSize: "13px",
              color: "rgba(0,0,0,0.5)",
              margin: 0,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            ¿No tenés cuenta?{" "}
            <a
              href="mailto:info@corporacionargom.com"
              style={{ color: "#000000", textDecoration: "underline" }}
            >
              Contactá a ARGON
            </a>{" "}
            para solicitar acceso.
          </p>
        </div>
      </main>
    </div>
  );
}

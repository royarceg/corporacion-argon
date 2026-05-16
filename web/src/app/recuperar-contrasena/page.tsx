"use client";

import { useState } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

type Step = "form" | "sent";

export default function RecuperarContrasenaPage() {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [resetLink, setResetLink] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/request-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      if (data.token) {
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        setResetLink(`${origin}/recuperar-contrasena/confirmar?token=${data.token}`);
      }
      setStep("sent");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-shell" style={{ alignItems: "stretch" }}>
      <AnnouncementBar />

      <header style={{ width: "100%", height: "68px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <a href="/" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 700, color: "#000000", textDecoration: "none", letterSpacing: "-0.02em" }}>
          ARGON.
        </a>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 32px", backgroundColor: "#f5f4f4" }}>
        <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#ffffff", padding: "48px 40px" }}>

          {step === "form" ? (
            <>
              <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "22px", fontWeight: 400, color: "#000000", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
                Recuperar contraseña
              </h1>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", margin: "0 0 32px 0", lineHeight: 1.6 }}>
                Ingresá tu nombre de usuario y te generaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <label style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, color: "#000000", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    autoFocus
                    placeholder="tu_usuario"
                    style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000000", backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.2)", padding: "12px 14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                </div>

                {error && (
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#9c0f0f", margin: 0 }}>{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, color: "#ffffff", backgroundColor: loading ? "rgba(0,0,0,0.4)" : "#000000", border: "none", padding: "14px", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.06em", textTransform: "uppercase", width: "100%", marginTop: "4px" }}
                >
                  {loading ? "Procesando..." : "Generar Enlace"}
                </button>
              </form>

              <div style={{ width: "100%", height: "1px", backgroundColor: "rgba(0,0,0,0.08)", margin: "32px 0" }} />

              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", margin: 0, textAlign: "center", lineHeight: 1.6 }}>
                <a href="/login" style={{ color: "#000000", textDecoration: "underline" }}>Volver al inicio de sesión</a>
              </p>
            </>
          ) : (
            <div style={{ textAlign: "center" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" style={{ marginBottom: "24px" }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, color: "#000000", margin: "0 0 12px 0", letterSpacing: "-0.02em" }}>
                Enlace generado
              </h1>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.6, margin: "0 0 24px 0" }}>
                Copiá el enlace de abajo y usalo para crear tu nueva contraseña. El enlace expira en 1 hora.
              </p>

              {resetLink && (
                <div style={{ backgroundColor: "#f5f4f4", padding: "16px", marginBottom: "24px", wordBreak: "break-all", textAlign: "left" }}>
                  <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.45)", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    Tu enlace de recuperación:
                  </p>
                  <a href={resetLink} style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", color: "#000", wordBreak: "break-all" }}>
                    {resetLink}
                  </a>
                </div>
              )}

              <a
                href={resetLink || "/login"}
                style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, color: "#ffffff", backgroundColor: "#000000", textDecoration: "none", padding: "14px 32px", display: "inline-block", letterSpacing: "0.04em" }}
              >
                Continuar al Enlace
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

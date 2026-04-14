"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

function ConfirmarContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error");
      setDone(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#9c0f0f" }}>
          Enlace inválido. <a href="/recuperar-contrasena" style={{ color: "#000", textDecoration: "underline" }}>Solicitá uno nuevo</a>.
        </p>
      </div>
    );
  }

  return (
    <>
      {done ? (
        <div style={{ textAlign: "center" }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" style={{ marginBottom: "24px" }}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 400, color: "#000000", margin: "0 0 12px 0" }}>
            Contraseña actualizada
          </h1>
          <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", lineHeight: 1.6 }}>
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      ) : (
        <>
          <h1 style={{ fontFamily: "StyreneA, sans-serif", fontSize: "22px", fontWeight: 400, color: "#000000", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
            Nueva contraseña
          </h1>
          <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.5)", margin: "0 0 32px 0", lineHeight: 1.6 }}>
            Elegí una contraseña segura para tu cuenta.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {[
              { label: "Nueva contraseña", value: password, set: setPassword },
              { label: "Confirmar contraseña", value: confirm, set: setConfirm },
            ].map((field) => (
              <div key={field.label} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, color: "#000000", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  {field.label}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPw ? "text" : "password"}
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    required
                    placeholder="••••••••"
                    style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#000000", backgroundColor: "#ffffff", border: "1px solid rgba(0,0,0,0.2)", padding: "12px 40px 12px 14px", outline: "none", width: "100%", boxSizing: "border-box" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", color: "rgba(0,0,0,0.4)" }}
                  >
                    {showPw ? (
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
            ))}

            {error && (
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "#9c0f0f", margin: 0 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", fontWeight: 500, color: "#ffffff", backgroundColor: loading ? "rgba(0,0,0,0.4)" : "#000000", border: "none", padding: "14px", cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.06em", textTransform: "uppercase", width: "100%", marginTop: "4px" }}
            >
              {loading ? "Guardando..." : "Actualizar Contraseña"}
            </button>
          </form>
        </>
      )}
    </>
  );
}

export default function ConfirmarPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#ffffff", display: "flex", flexDirection: "column" }}>
      <AnnouncementBar />
      <header style={{ width: "100%", height: "68px", display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
        <a href="/" style={{ fontFamily: "StyreneA, sans-serif", fontSize: "20px", fontWeight: 700, color: "#000000", textDecoration: "none", letterSpacing: "-0.02em" }}>
          ARGON.
        </a>
      </header>
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 32px", backgroundColor: "#f5f4f4" }}>
        <div style={{ width: "100%", maxWidth: "420px", backgroundColor: "#ffffff", padding: "48px 40px" }}>
          <Suspense>
            <ConfirmarContent />
          </Suspense>
        </div>
      </main>
    </div>
  );
}

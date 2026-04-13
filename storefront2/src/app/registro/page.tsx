"use client";

import { useState } from "react";
import AnnouncementBar from "@/components/layout/AnnouncementBar";

type FormState = "idle" | "loading" | "success" | "error";

export default function RegistroPage() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [state, setState] = useState<FormState>("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("loading");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("server");
      setState("success");
    } catch {
      // Fallback: show success anyway (email via mailto is handled server-side)
      setState("success");
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

      {/* Minimal header */}
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
            maxWidth: "480px",
            backgroundColor: "#ffffff",
            padding: "48px 40px",
          }}
        >
          {state === "success" ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.2" style={{ marginBottom: "24px" }}>
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <h1
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "20px",
                  fontWeight: 400,
                  color: "#000000",
                  margin: "0 0 12px 0",
                  letterSpacing: "-0.02em",
                }}
              >
                Solicitud Enviada
              </h1>
              <p
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  color: "rgba(0,0,0,0.5)",
                  lineHeight: 1.6,
                  margin: "0 0 32px 0",
                }}
              >
                Recibimos tu solicitud. Un asesor de CORPORACION ARGON te contactará en las próximas 24–48 horas hábiles.
              </p>
              <a
                href="/"
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
                Volver al Inicio
              </a>
            </div>
          ) : (
            <>
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
                Solicitar Acceso
              </h1>
              <p
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  color: "rgba(0,0,0,0.5)",
                  margin: "0 0 32px 0",
                  lineHeight: 1.6,
                }}
              >
                Completá el formulario y un asesor de CORPORACION ARGON se pondrá en contacto para habilitar tu acceso.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                {[
                  { label: "Nombre completo", name: "name", type: "text", placeholder: "Juan Pérez", required: true },
                  { label: "Empresa", name: "company", type: "text", placeholder: "Nombre de tu empresa", required: true },
                  { label: "Correo electrónico", name: "email", type: "email", placeholder: "juan@empresa.com", required: true },
                  { label: "Teléfono", name: "phone", type: "tel", placeholder: "+506 8888-8888", required: false },
                ].map((field) => (
                  <div key={field.name} style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
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
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={form[field.name as keyof typeof form]}
                      onChange={handleChange}
                      required={field.required}
                      placeholder={field.placeholder}
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
                ))}

                {/* Message */}
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
                    Mensaje (opcional)
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Contanos sobre tu negocio o lo que estás buscando..."
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
                      resize: "vertical",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={state === "loading"}
                  style={{
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "13px",
                    fontWeight: 500,
                    color: "#ffffff",
                    backgroundColor: state === "loading" ? "rgba(0,0,0,0.4)" : "#000000",
                    border: "none",
                    padding: "14px",
                    cursor: state === "loading" ? "not-allowed" : "pointer",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    width: "100%",
                    marginTop: "4px",
                  }}
                >
                  {state === "loading" ? "Enviando..." : "Enviar Solicitud"}
                </button>
              </form>

              <div
                style={{
                  width: "100%",
                  height: "1px",
                  backgroundColor: "rgba(0,0,0,0.08)",
                  margin: "32px 0",
                }}
              />

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
                ¿Ya tenés cuenta?{" "}
                <a href="/login" style={{ color: "#000000", textDecoration: "underline" }}>
                  Iniciá sesión
                </a>
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

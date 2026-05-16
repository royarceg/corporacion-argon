"use client";

import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function SucursalesPage() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Icon bounce in
    if (iconRef.current) {
      animate(iconRef.current, {
        opacity: [0, 1],
        scale: [0, 1],
        rotate: ["-15deg", "0deg"],
        duration: 800,
        ease: "outBack",
      });
    }

    // Badge
    if (badgeRef.current) {
      animate(badgeRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 600,
        delay: 200,
        ease: "outExpo",
      });
    }

    // Title: split into chars
    if (titleRef.current) {
      const text = titleRef.current.textContent || "";
      titleRef.current.innerHTML = "";
      text.split("").forEach((char) => {
        const span = document.createElement("span");
        span.textContent = char === " " ? "\u00A0" : char;
        span.style.display = "inline-block";
        span.style.opacity = "0";
        titleRef.current!.appendChild(span);
      });

      animate(titleRef.current.querySelectorAll("span"), {
        opacity: [0, 1],
        translateY: [60, 0],
        duration: 700,
        delay: stagger(40, { start: 300 }),
        ease: "outExpo",
      });
    }

    // Subtitle
    if (subtitleRef.current) {
      animate(subtitleRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: 700,
        ease: "outExpo",
      });
    }

    // Animated bars background
    if (barsRef.current) {
      const bars = barsRef.current.querySelectorAll(".bar");
      animate(bars, {
        scaleY: [0, 1],
        opacity: [0, 0.06],
        duration: 1000,
        delay: stagger(60, { start: 100, from: "center" }),
        ease: "outExpo",
      });

      // Continuous wave
      animate(bars, {
        scaleY: [0.3, 1],
        opacity: [0.03, 0.08],
        duration: 3000,
        delay: stagger(100, { from: "center" }),
        loop: true,
        alternate: true,
        ease: "inOutSine",
      });
    }

    // Placeholder cards
    if (cardsRef.current) {
      const cards = cardsRef.current.querySelectorAll(".loc-card");
      animate(cards, {
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.95, 1],
        duration: 600,
        delay: stagger(120, { start: 900 }),
        ease: "outExpo",
      });
    }
  }, []);

  const bars = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="page-shell">
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "60px 40px 100px", position: "relative", overflow: "hidden" }}>

        {/* Animated bars background */}
        <div
          ref={barsRef}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "60%",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: "12px",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {bars.map((i) => (
            <div
              key={i}
              className="bar"
              style={{
                width: "3px",
                height: `${30 + Math.random() * 70}%`,
                backgroundColor: "#000",
                opacity: 0,
                transformOrigin: "bottom",
                borderRadius: "2px 2px 0 0",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>

          {/* Pin icon */}
          <div ref={iconRef} style={{ opacity: 0, marginBottom: "8px" }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>

          {/* Badge */}
          <div
            ref={badgeRef}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              border: "1px solid rgba(0,0,0,0.15)",
              padding: "6px 16px",
              borderRadius: "999px",
              opacity: 0,
            }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#d4a017", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)" }}>
              En construcción
            </span>
          </div>

          {/* Title */}
          <h1
            ref={titleRef}
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "64px",
              fontWeight: 300,
              color: "#000",
              letterSpacing: "-3px",
              lineHeight: 1,
              margin: 0,
            }}
          >
            Sucursales
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              color: "rgba(0,0,0,0.45)",
              lineHeight: 1.6,
              maxWidth: "460px",
              margin: 0,
              opacity: 0,
            }}
          >
            Estamos preparando la información de nuestras ubicaciones y puntos de atención. Pronto podrás encontrar la sucursal más cercana.
          </p>
        </div>

        {/* Placeholder location cards */}
        <div ref={cardsRef} style={{ position: "relative", zIndex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginTop: "56px", maxWidth: "720px", width: "100%" }}>
          {[
            { name: "Sede Central", status: "Próximamente" },
            { name: "Zona Norte", status: "Próximamente" },
            { name: "Zona Sur", status: "Próximamente" },
          ].map((loc) => (
            <div
              key={loc.name}
              className="loc-card"
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                opacity: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "14px", fontWeight: 500, color: "#000", margin: 0 }}>{loc.name}</p>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "rgba(0,0,0,0.35)", letterSpacing: "0.06em", textTransform: "uppercase", margin: 0 }}>{loc.status}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="/productos"
          style={{
            position: "relative",
            zIndex: 1,
            fontFamily: "StyreneA, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#000",
            textDecoration: "none",
            borderBottom: "1px solid #000",
            paddingBottom: "2px",
            marginTop: "32px",
          }}
        >
          Explorar productos →
        </a>
      </main>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>

      <Footer />
    </div>
  );
}

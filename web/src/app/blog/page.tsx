"use client";

import { useEffect, useRef } from "react";
import { animate, stagger, utils } from "animejs";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function BlogPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Badge fade in + scale
    if (badgeRef.current) {
      animate(badgeRef.current, {
        opacity: [0, 1],
        scale: [0.8, 1],
        duration: 600,
        ease: "outExpo",
      });
    }

    // Title: split into chars and animate each
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
        translateY: [40, 0],
        rotateX: [90, 0],
        duration: 800,
        delay: stagger(30, { start: 200 }),
        ease: "outExpo",
      });
    }

    // Subtitle fade in
    if (subtitleRef.current) {
      animate(subtitleRef.current, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 800,
        delay: 600,
        ease: "outExpo",
      });
    }

    // Line expand
    if (lineRef.current) {
      animate(lineRef.current, {
        scaleX: [0, 1],
        duration: 1200,
        delay: 400,
        ease: "outExpo",
      });
    }

    // Floating dots grid
    if (dotsRef.current) {
      const dots = dotsRef.current.querySelectorAll(".dot");
      animate(dots, {
        opacity: [0, 0.15],
        scale: [0, 1],
        duration: 600,
        delay: stagger(20, { start: 300, from: "center" }),
        ease: "outExpo",
      });

      // Continuous breathing
      animate(dots, {
        opacity: [0.08, 0.25],
        scale: [0.9, 1.1],
        duration: 2000,
        delay: stagger(80, { from: "center" }),
        loop: true,
        alternate: true,
        ease: "inOutSine",
      });
    }
  }, []);

  // Generate dot grid
  const dots = Array.from({ length: 120 }, (_, i) => i);

  return (
    <div className="page-shell">
      <AnnouncementBar />
      <Header />

      <main
        ref={containerRef}
        style={{
          width: "100%",
          maxWidth: "1400px",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 40px 120px",
          position: "relative",
          overflow: "hidden",
          minHeight: "70vh",
        }}
      >
        {/* Dot grid background */}
        <div
          ref={dotsRef}
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            gridTemplateColumns: "repeat(15, 1fr)",
            gridTemplateRows: "repeat(8, 1fr)",
            gap: "0",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {dots.map((i) => (
            <div
              key={i}
              className="dot"
              style={{
                width: "4px",
                height: "4px",
                borderRadius: "50%",
                backgroundColor: "#000",
                opacity: 0,
                margin: "auto",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "24px" }}>

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
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#3a6b3a", animation: "pulse 2s infinite" }} />
            <span style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.5)" }}>
              En desarrollo
            </span>
          </div>

          {/* Line */}
          <div
            ref={lineRef}
            style={{
              width: "60px",
              height: "1px",
              backgroundColor: "#000",
              transformOrigin: "center",
              transform: "scaleX(0)",
            }}
          />

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
            Blog
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
              maxWidth: "420px",
              margin: 0,
              opacity: 0,
            }}
          >
            Estamos preparando contenido sobre equipamiento táctico, uniformes y novedades del sector. Muy pronto podrás leer nuestros artículos aquí.
          </p>

          {/* CTA */}
          <a
            href="/productos"
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#000",
              textDecoration: "none",
              borderBottom: "1px solid #000",
              paddingBottom: "2px",
              marginTop: "8px",
            }}
          >
            Explorar productos →
          </a>
        </div>
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

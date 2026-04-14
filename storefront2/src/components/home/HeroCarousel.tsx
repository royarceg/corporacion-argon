"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";

const slides = [
  {
    id: 1,
    leftImg: "/hero/hero-zap02-v1.png",
    rightImg: "/hero/hero-cht02-v12.png",
    tag: "Colección K9",
    title: "Lista. Equipada.\nPara cualquier misión.",
    cta1: { label: "Ver botas", href: "/botas" },
    cta2: { label: "Ver chalecos", href: "/proteccion" },
  },
  {
    id: 2,
    leftImg: "/hero/hero-abr01-v2.png",
    rightImg: "/hero/hero-cug02-v2.png",
    tag: "Uniformes Profesionales",
    title: "Diseñados para\nidentificarte.",
    cta1: { label: "Ver uniformes", href: "/uniformes" },
    cta2: { label: "Ver catálogo", href: "/catalogo" },
  },
];

export default function HeroCarousel() {
  const currentRef = useRef(0);
  const slidesRef = useRef<HTMLDivElement[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  const goTo = (i: number) => {
    slidesRef.current.forEach((s, idx) => {
      if (s) {
        s.style.opacity = idx === i ? "1" : "0";
        s.style.zIndex = idx === i ? "1" : "0";
      }
    });
    if (progressRef.current) {
      const pct = ((i + 1) / slides.length) * 100;
      progressRef.current.style.width = `${pct}%`;
    }
    currentRef.current = i;
  };

  const next = () => {
    goTo((currentRef.current + 1) % slides.length);
  };

  useEffect(() => {
    goTo(0);
    const interval = setInterval(next, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative overflow-hidden mx-2.5"
      style={{ borderRadius: "20px", aspectRatio: "1900 / 1084" }}
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          ref={(el) => { if (el) slidesRef.current[i] = el; }}
          className="absolute inset-0 flex transition-opacity duration-700"
          style={{ opacity: 0, gap: "4px" }}
        >
          {/* Left image */}
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={slide.leftImg}
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
              priority={i === 0}
            />
          </div>

          {/* Right image + text overlay */}
          <div className="relative flex-1 overflow-hidden">
            <Image
              src={slide.rightImg}
              alt=""
              fill
              className="object-cover"
              sizes="50vw"
            />

            {/* Text overlay — bottom right */}
            <div
              className="absolute bottom-0 right-0 p-10 flex flex-col items-end gap-3 z-10"
              style={{ maxWidth: "480px" }}
            >
              <span
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "white",
                  textTransform: "uppercase",
                  letterSpacing: "1.2px",
                  lineHeight: "20px",
                }}
              >
                {slide.tag}
              </span>
              <h2
                style={{
                  fontFamily: "SelfModern, serif",
                  fontSize: "32px",
                  fontWeight: 400,
                  color: "white",
                  lineHeight: "40px",
                  margin: 0,
                  textAlign: "right",
                  whiteSpace: "pre-line",
                }}
              >
                {slide.title}
              </h2>
              <div className="flex gap-2 mt-2">
                <a
                  href={slide.cta1.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    color: "var(--color-charcoal)",
                    background: "var(--color-white)",
                    borderRadius: "9999px",
                    padding: "0 16px",
                    height: "33px",
                    textDecoration: "none",
                  }}
                >
                  {slide.cta1.label}
                </a>
                <a
                  href={slide.cta2.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    color: "var(--color-charcoal)",
                    background: "var(--color-white)",
                    borderRadius: "9999px",
                    padding: "0 16px",
                    height: "33px",
                    textDecoration: "none",
                  }}
                >
                  {slide.cta2.label}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Arrow — right side */}
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center"
        style={{
          width: "32px",
          height: "32px",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
        aria-label="Siguiente"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Progress bar — bottom */}
      <div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20"
        style={{ width: "calc(100% - 80px)", height: "4px", background: "rgba(255,255,255,0.3)", borderRadius: "10px" }}
      >
        <div
          ref={progressRef}
          style={{
            height: "100%",
            background: "white",
            borderRadius: "10px",
            transition: "width 0.5s ease",
            width: "50%",
          }}
        />
      </div>
    </div>
  );
}

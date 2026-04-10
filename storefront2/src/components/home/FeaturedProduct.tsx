"use client";
import { useState } from "react";
import Image from "next/image";

const slides = [
  { id: 1, img: "/products/ZAP-02.png" },
  { id: 2, img: "/products/COL-01.png" },
  { id: 3, img: "/products/CAP-01.png" },
];

export default function FeaturedProduct() {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="mx-2.5 overflow-hidden" style={{ borderRadius: "20px" }}>
      <div className="flex" style={{ minHeight: "672px" }}>
        {/* Left — image placeholder */}
        <div
          className="relative flex-1 flex items-center justify-center"
          style={{ background: "var(--color-featured-bg)" }}
        >
          <div className="relative w-full h-full">
            <Image
              src={slides[current].img}
              alt="Producto destacado"
              fill
              className="object-contain"
              sizes="70vw"
            />
          </div>

          {/* Prev arrow */}
          <button
            onClick={prev}
            className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ width: "120px", height: "120px", background: "none", border: "none", cursor: "pointer" }}
            aria-label="Anterior"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Next arrow */}
          <button
            onClick={next}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center"
            style={{ width: "120px", height: "120px", background: "none", border: "none", cursor: "pointer" }}
            aria-label="Siguiente"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18L15 12L9 6" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Right — info placeholder */}
        <div
          className="flex flex-col justify-center gap-5 px-16 py-12"
          style={{ width: "576px", flexShrink: 0, background: "var(--color-natural-white)" }}
        >
          {/* Tag placeholder */}
          <div style={{ width: "120px", height: "12px", background: "rgba(0,0,0,0.12)", borderRadius: "2px" }} />

          {/* Title placeholder */}
          <div className="flex flex-col gap-2">
            <div style={{ width: "280px", height: "40px", background: "rgba(0,0,0,0.08)", borderRadius: "4px" }} />
            <div style={{ width: "200px", height: "40px", background: "rgba(0,0,0,0.08)", borderRadius: "4px" }} />
          </div>

          {/* Desc placeholder */}
          <div className="flex flex-col gap-2">
            <div style={{ width: "340px", height: "14px", background: "rgba(0,0,0,0.06)", borderRadius: "2px" }} />
            <div style={{ width: "300px", height: "14px", background: "rgba(0,0,0,0.06)", borderRadius: "2px" }} />
            <div style={{ width: "260px", height: "14px", background: "rgba(0,0,0,0.06)", borderRadius: "2px" }} />
          </div>

          {/* CTA pills placeholder */}
          <div className="flex gap-3 mt-2">
            <div style={{ width: "140px", height: "40px", background: "var(--color-charcoal)", borderRadius: "9999px", opacity: 0.15 }} />
            <div style={{ width: "120px", height: "40px", border: "1px solid var(--color-charcoal)", borderRadius: "9999px", opacity: 0.15 }} />
          </div>

          {/* Dots */}
          <div className="flex gap-2 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                style={{
                  width: "8px", height: "8px", borderRadius: "9999px",
                  background: "var(--color-charcoal)",
                  opacity: i === current ? 1 : 0.25,
                  border: "none", cursor: "pointer", padding: 0,
                }}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

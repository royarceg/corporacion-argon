"use client";
import { useState } from "react";
import Image from "next/image";

const categories = [
  {
    slug: "uniformes",
    label: "Uniformes",
    bg: "#6b7c5a",
    img: "/products/nobg/COL-01.png",
    imgHover: "/products/nobg/COL-01.png",
    cta: "Ver uniformes",
  },
  {
    slug: "botas",
    label: "Botas",
    bg: "#8a7d72",
    img: "/products/nobg/ZAP-02.png",
    imgHover: "/products/nobg/ZAP-02.png",
    cta: "Ver botas",
  },
  {
    slug: "proteccion",
    label: "Protección",
    bg: "#a09689",
    img: "/products/nobg/CHT-02.png",
    imgHover: "/products/nobg/CHT-02.png",
    cta: "Ver protección",
  },
  {
    slug: "moto",
    label: "Equipamiento",
    bg: "#5b6a7a",
    img: "/products/nobg/CAP-01.png",
    imgHover: "/products/nobg/CAP-01.png",
    cta: "Ver equipamiento",
  },
];

function CategoryCard({ cat }: { cat: (typeof categories)[0] }) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href={`/${cat.slug}`}
      className="relative flex-1 overflow-hidden group"
      style={{
        aspectRatio: "0.77 / 1",
        borderRadius: hovered ? "40px" : "20px",
        textDecoration: "none",
        display: "block",
        background: cat.bg,
        transition: "border-radius 0.3s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Normal image — full bleed */}
      <Image
        src={cat.img}
        alt={cat.label}
        fill
        className="object-contain transition-opacity duration-300"
        style={{ opacity: hovered ? 0 : 1, padding: "15%" }}
        sizes="25vw"
      />

      {/* Hover image — full bleed */}
      <Image
        src={cat.imgHover}
        alt={cat.label}
        fill
        className="object-contain transition-opacity duration-300"
        style={{ opacity: hovered ? 1 : 0, padding: "10%" }}
        sizes="25vw"
      />

      {/* Dark overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "rgba(0,0,0,0.15)" }}
      />

      {/* Centered text + buttons */}
      <span className="absolute inset-0 z-20 m-auto flex h-fit w-fit flex-col items-center justify-center gap-2">
        {/* Title pill — fades out on hover */}
        <h2
          className="transition-opacity duration-300"
          style={{
            opacity: hovered ? 0 : 1,
            fontFamily: "Graphik, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.3px",
            color: "white",
            border: "1px solid white",
            borderRadius: "9999px",
            padding: "8px 16px",
            background: "transparent",
            margin: 0,
          }}
        >
          {cat.label}
        </h2>

        {/* CTA button — fades in on hover */}
        <span
          className="transition-all duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(30%)",
          }}
        >
          <span
            style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "12px",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.3px",
              color: "white",
              border: "1px solid white",
              borderRadius: "9999px",
              padding: "8px 16px",
              background: "transparent",
              display: "inline-flex",
              pointerEvents: hovered ? "auto" : "none",
            }}
          >
            {cat.cta}
          </span>
        </span>
      </span>
    </a>
  );
}

export default function CategoryRow() {
  return (
    <div style={{ padding: "10px", marginTop: "10px" }}>
      <div className="flex" style={{ gap: "10px" }}>
        {categories.map((cat) => (
          <CategoryCard key={cat.slug} cat={cat} />
        ))}
      </div>
    </div>
  );
}

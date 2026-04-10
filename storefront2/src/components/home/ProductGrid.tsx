"use client";
import Image from "next/image";
import { useRef } from "react";
import { Product } from "@/types";

function ScrollCard({ product }: { product: Product }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col cursor-pointer"
      style={{ width: "463px" }}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: "16px 16px 0 0",
          height: "520px",
          background: "#f0ede8",
        }}
      >
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          className="object-contain"
          sizes="463px"
        />
      </div>

      {/* Info */}
      <div className="pt-3 pb-4 px-1">
        <p
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "14px",
            fontWeight: 500,
            color: "#000",
            letterSpacing: "0.7px",
            marginBottom: "2px",
          }}
        >
          {product.name}
        </p>
        {product.color && (
          <p
            style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "14px",
              fontWeight: 400,
              color: "#000",
              letterSpacing: "0.7px",
              marginBottom: "4px",
              textTransform: "capitalize",
            }}
          >
            {product.color.charAt(0).toUpperCase() + product.color.slice(1).toLowerCase()}
          </p>
        )}
        <p
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "12px",
            fontWeight: 500,
            color: "#000",
            letterSpacing: "0.6px",
          }}
        >
          Consultar precio
        </p>
      </div>
    </div>
  );
}

export default function ProductGrid({ products }: { products: Product[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const featured = products.slice(0, 8);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 480;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div style={{ paddingTop: "20px", paddingBottom: "20px" }}>
      {/* Title row */}
      <div
        className="flex items-center justify-between px-2.5"
        style={{ marginBottom: "24px" }}
      >
        <p
          style={{
            fontFamily: "AkkuratMono, monospace",
            fontSize: "12px",
            fontWeight: 400,
            textTransform: "uppercase",
            letterSpacing: "1.2px",
            color: "var(--color-charcoal)",
            margin: 0,
          }}
        >
          Explorar productos
        </p>

        {/* Nav arrows */}
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="flex items-center justify-center"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9999px",
              border: "1px solid var(--color-charcoal)",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
              color: "var(--color-charcoal)",
            }}
            aria-label="Anterior"
          >
            &larr;
          </button>
          <button
            onClick={() => scroll("right")}
            className="flex items-center justify-center"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "9999px",
              border: "1px solid var(--color-charcoal)",
              background: "transparent",
              cursor: "pointer",
              fontSize: "16px",
              color: "var(--color-charcoal)",
            }}
            aria-label="Siguiente"
          >
            &rarr;
          </button>
        </div>
      </div>

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="flex gap-2.5 overflow-x-auto px-2.5"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {featured.map((p) => (
          <ScrollCard key={p.code} product={p} />
        ))}
      </div>
    </div>
  );
}

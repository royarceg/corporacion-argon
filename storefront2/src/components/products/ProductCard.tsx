"use client";

import { useState } from "react";
import { ApiProduct } from "@/services/productService";

interface Props {
  product: ApiProduct;
  onAddToCart?: (product: ApiProduct) => void;
}

export default function ProductCard({ product, onAddToCart }: Props) {
  const [hovered, setHovered] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  const image = product.images?.[0] ?? null;
  const price = parseFloat(product.price).toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  });

  return (
    <div
      style={{ position: "relative", cursor: "pointer" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => window.location.href = `/productos/${product.id}`}
    >
      {/* Image container */}
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          backgroundColor: "#f5f4f4",
          overflow: "hidden",
          marginBottom: "12px",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.03)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#f5f4f4" }} />
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          aria-label="Agregar a wishlist"
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            opacity: hovered || wishlisted ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#000" : "none"} stroke="#000000" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Add to cart button */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
          aria-label="Agregar al carrito"
          style={{
            position: "absolute",
            bottom: "12px",
            right: "12px",
            width: "28px",
            height: "28px",
            backgroundColor: "#ffffff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Color swatches */}
        {product.colors.length > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              display: "flex",
              gap: "4px",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color}
                title={color}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: colorToHex(color),
                  border: "1px solid rgba(0,0,0,0.15)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <p
        style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          color: "#000000",
          margin: "0 0 4px 0",
          lineHeight: 1.4,
        }}
      >
        {product.name}
      </p>
      <p
        style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          color: "rgba(0,0,0,0.6)",
          margin: 0,
        }}
      >
        {price}
      </p>
    </div>
  );
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    NEGRO: "#1a1a1a",
    BEIGE: "#d4b896",
    BLANCO: "#ffffff",
    GRIS: "#9e9e9e",
    AZUL: "#2d6a9f",
    ROJO: "#9c2121",
    VERDE: "#3a6b3a",
    NARANJA: "#d4612a",
    AMARILLO: "#d4c12a",
    CAFE: "#7a5c3a",
    MARRON: "#7a5c3a",
  };
  return map[color.toUpperCase()] ?? "#cccccc";
}

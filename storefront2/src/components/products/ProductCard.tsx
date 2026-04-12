"use client";

import { useState } from "react";
import { ApiProduct } from "@/services/productService";

interface Props {
  product: ApiProduct;
  onAddToCart?: (product: ApiProduct) => void;
  onQuickView?: (product: ApiProduct) => void;
}

export default function ProductCard({ product, onAddToCart, onQuickView }: Props) {
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
      onClick={() => onQuickView?.(product)}
    >
      {/* Image container */}
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          backgroundColor: "#F0EFEF",
          overflow: "hidden",
          marginBottom: "10px",
        }}
      >
        {image ? (
          <img
            src={image}
            alt={product.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.03)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "#F0EFEF" }} />
        )}

        {/* Wishlist — always visible, like Figma */}
        <button
          onClick={(e) => { e.stopPropagation(); setWishlisted(!wishlisted); }}
          aria-label="Add to wishlist"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            opacity: wishlisted ? 1 : 0.45,
            transition: "opacity 0.2s ease",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? "#000" : "none"} stroke="#000000" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Quick add "+" — appears on hover, bottom-right */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}
          aria-label="Quick add"
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
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

        {/* Color swatches overlay — bottom-left, on hover */}
        {product.colors.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              left: "10px",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s ease",
            }}
          >
            <span style={{ fontFamily: "Graphik, sans-serif", fontSize: "11px", color: "#000", marginRight: "4px" }}>
              {product.colors[0]}
            </span>
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color}
                title={color}
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: colorToHex(color),
                  border: "1px solid rgba(0,0,0,0.2)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Product name */}
      <p
        style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          color: "#000000",
          margin: "0 0 2px 0",
          lineHeight: 1.4,
        }}
      >
        {product.name}
      </p>

      {/* Price */}
      <p
        style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "13px",
          fontWeight: 400,
          color: "#000000",
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
    NEGRO: "#1a1a1a", BEIGE: "#d4b896", BLANCO: "#f5f5f5",
    GRIS: "#9e9e9e", AZUL: "#2d6a9f", ROJO: "#9c2121",
    VERDE: "#3a6b3a", NARANJA: "#d4612a", AMARILLO: "#d4c12a",
    CAFE: "#7a5c3a", MARRON: "#7a5c3a",
  };
  return map[color.toUpperCase()] ?? "#cccccc";
}

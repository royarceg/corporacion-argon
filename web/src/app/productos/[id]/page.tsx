"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { sortSizes } from "@/utils/sortSizes";
import { colorToHex } from "@/utils/colorToHex";
import { formatPrice } from "@/utils/formatPrice";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useCart } from "@/context/CartContext";
import { productService, ApiProduct, ApiProductDetail, ApiVariant } from "@/services/productService";
import { siblingService, Sibling } from "@/services/siblingService";
import { animate } from "animejs";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated, loading } = useRequireAuth();
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState<ApiProductDetail | null>(null);
  const [fetching, setFetching] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [note, setNote] = useState("");
  const [openAccordion, setOpenAccordion] = useState<string | null>("descripcion");
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [related, setRelated] = useState<ApiProduct[]>([]);
  const [completeLook, setCompleteLook] = useState<ApiProduct[]>([]);
  const imagesRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const relatedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && isAuthenticated()) {
      productService.getProductById(Number(id))
        .then((p) => {
          setProduct(p);
          setSelectedColor(p.colors?.[0] ?? null);
        })
        .catch(() => router.replace("/productos"))
        .finally(() => setFetching(false));

      siblingService.getForProduct(Number(id))
        .then(setSiblings)
        .catch(() => setSiblings([]));

      productService.getProducts()
        .then((all) => {
          const pid = Number(id);
          const current = all.find((p) => p.id === pid);
          const others = all.filter((p) => p.id !== pid);

          // Mapeo de categorías complementarias para "Completá tu equipo"
          const complementMap: Record<string, string[]> = {
            "ZAPATOS DE SEGURIDAD": ["UNIFORME", "SEGURIDAD", "PROTECCION", "PROMOCIONALES"],
            "UNIFORME": ["ZAPATOS DE SEGURIDAD", "PROTECCION", "SEGURIDAD"],
            "PROTECCION": ["UNIFORME", "ZAPATOS DE SEGURIDAD", "SEGURIDAD"],
            "SEGURIDAD": ["UNIFORME", "PROTECCION", "ZAPATOS DE SEGURIDAD"],
            "MOTOCICLETA": ["PROTECCION", "SEGURIDAD", "UNIFORME"],
            "HIGIENE": ["UNIFORME", "PROTECCION"],
            "ILUMINACION": ["SEGURIDAD", "MOTOCICLETA"],
            "PROMOCIONALES": ["UNIFORME", "PROMOCIONALES"],
            "PARAGUAS": ["UNIFORME", "PROMOCIONALES"],
            "PUBLICIDAD EXTERIOR": ["PROMOCIONALES"],
          };

          // COMPLETA TU EQUIPO — siempre 5 productos
          const complementaryCats = complementMap[current?.category ?? ""] ?? [];
          const complementary = others.filter((p) => complementaryCats.includes(p.category ?? ""));
          // Shuffle complementary for variety
          const shuffled = [...complementary].sort(() => Math.random() - 0.5);
          let lookPicks = shuffled.slice(0, 5);
          if (lookPicks.length < 5) {
            // Si no alcanza, rellenar con otros productos (no la categoría actual)
            const fillers = others.filter(
              (p) => p.category !== current?.category && !lookPicks.some((x) => x.id === p.id)
            ).sort(() => Math.random() - 0.5);
            lookPicks = [...lookPicks, ...fillers].slice(0, 5);
          }
          if (lookPicks.length < 5) {
            // Última chance: rellenar con cualquier otro (incluso misma cat)
            const remaining = others.filter((p) => !lookPicks.some((x) => x.id === p.id));
            lookPicks = [...lookPicks, ...remaining].slice(0, 5);
          }
          setCompleteLook(lookPicks);

          // TAMBIÉN TE PUEDE INTERESAR — mix 12 productos (misma cat + variado)
          const sameCat = others.filter((p) => p.category === current?.category);
          const diffCat = others.filter(
            (p) => p.category !== current?.category && !lookPicks.some((x) => x.id === p.id)
          ).sort(() => Math.random() - 0.5);
          const interestPicks = [...sameCat, ...diffCat].slice(0, 12);
          setRelated(interestPicks);
        })
        .catch(() => { setRelated([]); setCompleteLook([]); });
    }
  }, [id, loading, isAuthenticated, router]);

  function resolveVariant(): ApiVariant | null {
    if (!product?.variants?.length) return null;
    return product.variants.find(
      (v) =>
        (selectedSize ? v.size === selectedSize : true) &&
        (selectedColor ? v.color === selectedColor : true)
    ) ?? null;
  }

  async function handleAddToCart() {
    if (!product) return;
    setAdding(true);
    try {
      const variant = resolveVariant();
      await addToCart(product.id, qty, variant?.id, note.trim() || undefined);
      setAdded(true);
      setTimeout(() => setAdded(false), 2500);
    } finally {
      setAdding(false);
    }
  }

  // Animate on load
  useEffect(() => {
    if (!fetching && product) {
      if (imagesRef.current) {
        animate(imagesRef.current, { opacity: [0, 1], translateX: [-20, 0], duration: 600, ease: "outExpo" });
      }
      if (panelRef.current) {
        animate(panelRef.current, { opacity: [0, 1], translateX: [20, 0], duration: 600, delay: 100, ease: "outExpo" });
      }
    }
  }, [fetching, product]);

  if (loading || fetching || !product) {
    return (
      <div className="page-shell-centered">
        <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", color: "rgba(0,0,0,0.4)" }}>
          Cargando...
        </p>
      </div>
    );
  }

  const price = formatPrice(product.price);
  const colors = product.colors ?? [];
  const sizes = sortSizes(product.sizes ?? []);
  const images = product.images ?? [];
  const activeVariant = resolveVariant();

  const accordions = [
    {
      key: "descripcion",
      label: "Descripción",
      content: product.description || "Sin descripción.",
    },
    {
      key: "detalles",
      label: "Detalles del producto",
      content: `Categoría: ${product.category}\nSKU base: ${product.sku}`,
    },
  ];

  return (
    <div className="page-shell">
      <AnnouncementBar />
      <Header />

      <main style={{ width: "100%", maxWidth: "1400px", padding: "clamp(20px, 4vw, 40px) clamp(16px, 4vw, 40px) clamp(40px, 8vw, 80px)", flex: 1 }}>
        <div className="pdp-layout">
          <style>{`
            .pdp-layout { display: grid; grid-template-columns: 1fr; gap: clamp(24px, 4vw, 60px); align-items: start; }
            @media (min-width: 1024px) { .pdp-layout { grid-template-columns: minmax(0, 1fr) 400px; } }
          `}</style>

          {/* ── LEFT: imágenes — apiladas en desktop, carousel en mobile ── */}
          <style>{`
            .pdp-images { display: flex; flex-direction: column; gap: 4px; }
            @media (max-width: 767px) {
              .pdp-images {
                flex-direction: row;
                overflow-x: auto;
                scroll-snap-type: x mandatory;
                -webkit-overflow-scrolling: touch;
                gap: 0;
                margin-inline: calc(clamp(16px, 4vw, 40px) * -1);
              }
              .pdp-images::-webkit-scrollbar { display: none; }
              .pdp-images > div {
                flex: 0 0 100%;
                scroll-snap-align: start;
                aspect-ratio: 1/1 !important;
              }
            }
            /* Sticky bar mobile only */
            .pdp-sticky-bar { display: none; }
            @media (max-width: 1023px) {
              .pdp-sticky-bar {
                display: flex;
                position: fixed;
                bottom: 64px;
                left: 0;
                right: 0;
                background: #fff;
                border-top: 1px solid rgba(0,0,0,0.08);
                padding: 10px 16px;
                z-index: 40;
                align-items: center;
                gap: 12px;
                padding-bottom: calc(10px + env(safe-area-inset-bottom, 0px));
              }
              .pdp-sticky-info { flex: 1; min-width: 0; }
              .pdp-sticky-name { font-family: StyreneA, sans-serif; font-size: 12px; font-weight: 500; color: #000; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
              .pdp-sticky-price { font-family: StyreneA, sans-serif; font-size: 14px; color: rgba(0,0,0,0.7); margin: 0; }
              .pdp-sticky-cta { padding: 10px 16px; background: #000; color: #fff; font-size: 11px; text-transform: uppercase; letter-spacing: 0.04em; border: none; font-family: StyreneA, sans-serif; cursor: pointer; flex-shrink: 0; min-height: 40px; }
              /* Push body content to account for sticky bar */
              .pdp-bottom-spacer { height: 72px; }
            }
            @media (min-width: 1024px) { .pdp-bottom-spacer { display: none; } }
          `}</style>
          <div ref={imagesRef} className="pdp-images" style={{ opacity: 0 }}>
            {images.length > 0 ? images.map((img, i) => (
              <div
                key={i}
                style={{
                  width: "100%",
                  aspectRatio: "3/4",
                  backgroundColor: "#f5f4f4",
                  overflow: "hidden",
                }}
              >
                <img
                  src={img}
                  alt={`${product.name} ${i + 1}`}
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
            )) : (
              <div style={{ width: "100%", aspectRatio: "3/4", backgroundColor: "#f5f4f4" }} />
            )}
          </div>

          {/* ── RIGHT: panel sticky ── */}
          <div ref={panelRef} style={{ position: "sticky", top: "32px", display: "flex", flexDirection: "column", gap: "0", opacity: 0 }}>

            {/* Breadcrumb */}
            <p style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "11px",
              color: "rgba(0,0,0,0.4)",
              margin: "0 0 20px 0",
              letterSpacing: "0.02em",
            }}>
              <a
                href={product.category ? `/productos?cat=${encodeURIComponent(product.category)}` : "/productos"}
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "11px",
                  color: "rgba(0,0,0,0.4)",
                  letterSpacing: "0.02em",
                  textDecoration: "none",
                }}
              >
                ← Catálogo
              </a>
              {" / "}
              <span style={{ textTransform: "capitalize" }}>{product.category?.toLowerCase()}</span>
            </p>

            {/* Name */}
            <h1 style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "24px",
              fontWeight: 400,
              color: "#000",
              margin: "0 0 10px 0",
              letterSpacing: "-0.02em",
              lineHeight: 1.25,
            }}>
              {product.name}
            </h1>

            {/* Price */}
            <p style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              color: "#000",
              margin: "0 0 24px 0",
            }}>
              {price}
            </p>

            {/* Color */}
            {colors.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#000",
                  margin: "0 0 10px 0",
                }}>
                  Color: <span style={{ fontWeight: 400 }}>{selectedColor}</span>
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {colors.map((color) => (
                    <button
                      key={color}
                      title={color}
                      onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        backgroundColor: colorToHex(color),
                        border: selectedColor === color ? "2px solid #000" : "1px solid rgba(0,0,0,0.2)",
                        cursor: "pointer",
                        padding: 0,
                        outline: "none",
                        transition: "border 0.15s",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Siblings — otros colores */}
            {siblings.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#000", margin: "0 0 10px 0" }}>
                  También disponible en:
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {siblings.map((s) => (
                    <a
                      key={s.id}
                      href={`/productos/${s.id}`}
                      title={s.name}
                      style={{
                        display: "flex", alignItems: "center", gap: "8px",
                        padding: "6px 12px", border: "1px solid rgba(0,0,0,0.15)",
                        background: "#fff", textDecoration: "none",
                        fontFamily: "StyreneA, sans-serif", fontSize: "11px", color: "#000",
                      }}
                    >
                      {s.image && <img src={s.image} alt="" style={{ width: "28px", height: "28px", objectFit: "contain", borderRadius: "2px", backgroundColor: "#f5f4f4" }} />}
                      {s.color && <span style={{ width: "14px", height: "14px", borderRadius: "50%", backgroundColor: colorToHex(s.color), border: "1px solid rgba(0,0,0,0.2)", flexShrink: 0 }} />}
                      <span>{s.color || s.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {sizes.length > 0 && (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "10px" }}>
                  <p style={{
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#000",
                    margin: 0,
                  }}>
                    Talla:
                  </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize((prev) => prev === size ? null : size)}
                      style={{
                        fontFamily: "StyreneA, sans-serif",
                        fontSize: "12px",
                        color: selectedSize === size ? "#fff" : "#000",
                        backgroundColor: selectedSize === size ? "#000" : "#fff",
                        border: "1px solid rgba(0,0,0,0.25)",
                        padding: "7px 14px",
                        cursor: "pointer",
                        minWidth: "44px",
                        textAlign: "center",
                        transition: "all 0.1s ease",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Variant code */}
                {activeVariant?.sku_variant && (
                  <p style={{
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "11px",
                    color: "rgba(0,0,0,0.45)",
                    margin: "10px 0 0 0",
                    letterSpacing: "0.03em",
                  }}>
                    Código:{" "}
                    <span style={{ color: "#000", fontWeight: 500 }}>
                      {activeVariant.sku_variant}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* Quantity */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "12px",
                fontWeight: 500,
                color: "#000",
                margin: "0 0 10px 0",
              }}>
                Cantidad
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "0", border: "1px solid rgba(0,0,0,0.2)", width: "fit-content" }}>
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  style={{ width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span style={{ fontFamily: "StyreneA, sans-serif", fontSize: "13px", minWidth: "32px", textAlign: "center", borderLeft: "1px solid rgba(0,0,0,0.2)", borderRight: "1px solid rgba(0,0,0,0.2)", height: "36px", lineHeight: "36px" }}>
                  {qty}
                </span>
                <button
                  onClick={() => setQty(qty + 1)}
                  style={{ width: "36px", height: "36px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Nota / Comentarios */}
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#000", margin: "0 0 8px 0" }}>
                Nota o especificación
              </p>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: bordado con logo, color especial, cantidad exacta..."
                rows={3}
                style={{
                  width: "100%", fontFamily: "StyreneA, sans-serif", fontSize: "12px",
                  color: "#000", border: "1px solid rgba(0,0,0,0.15)", padding: "10px 12px",
                  outline: "none", resize: "vertical", boxSizing: "border-box", lineHeight: 1.5,
                }}
              />
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={adding}
              style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "13px",
                fontWeight: 500,
                color: "#fff",
                backgroundColor: added ? "#3a6b3a" : adding ? "rgba(0,0,0,0.4)" : "#000",
                border: "none",
                padding: "15px",
                cursor: adding ? "not-allowed" : "pointer",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                transition: "background-color 0.2s",
                marginBottom: "24px",
              }}
            >
              {added ? "✓ Agregado al carrito" : adding ? "Agregando..." : "Agregar al carrito"}
            </button>

            {/* Accordions */}
            <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
              {accordions.map((item) => (
                <div key={item.key} style={{ borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                  <button
                    onClick={() => setOpenAccordion((prev) => prev === item.key ? null : item.key)}
                    style={{
                      width: "100%",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 0",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "StyreneA, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#000",
                      textAlign: "left",
                    }}
                  >
                    {item.label}
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#000"
                      strokeWidth="1.5"
                      style={{
                        transform: openAccordion === item.key ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                        flexShrink: 0,
                      }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {openAccordion === item.key && (
                    <div style={{ paddingBottom: "16px" }}>
                      {item.content.split("\n").map((line, i) => (
                        <p key={i} style={{
                          fontFamily: "StyreneA, sans-serif",
                          fontSize: "13px",
                          color: "rgba(0,0,0,0.65)",
                          margin: i === 0 ? 0 : "6px 0 0 0",
                          lineHeight: 1.65,
                        }}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* ── Cross-sell: Adidas-style ── */}
        <style>{`
          .xsell-section { margin-top: 64px; padding-top: 48px; border-top: 1px solid rgba(0,0,0,0.08); }
          .xsell-header { margin-bottom: 28px; }
          .xsell-title { font-family: StyreneA, sans-serif; font-size: clamp(20px, 3vw, 26px); font-weight: 700; color: #000; margin: 0 0 6px; letter-spacing: -0.01em; text-transform: uppercase; }
          .xsell-sub { font-family: StyreneA, sans-serif; font-size: 13px; color: rgba(0,0,0,0.55); margin: 0; }
          .xsell-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
          @media (min-width: 640px) { .xsell-grid { grid-template-columns: repeat(3, 1fr); } }
          @media (min-width: 1024px) { .xsell-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; } }
          .xsell-card { position: relative; cursor: pointer; border: 1.5px solid transparent; padding: 12px; transition: border-color 0.2s; text-decoration: none; color: inherit; display: block; }
          .xsell-card:hover { border-color: rgba(0,0,0,0.15); }
          .xsell-heart { position: absolute; top: 16px; right: 16px; width: 28px; height: 28px; border: none; background: transparent; cursor: pointer; font-size: 22px; line-height: 1; z-index: 2; color: rgba(0,0,0,0.5); padding: 0; }
          .xsell-heart:hover { color: #000; }
          .xsell-img { aspect-ratio: 1/1; background-color: #f5f4f4; overflow: hidden; margin-bottom: 12px; display: flex; align-items: center; justify-content: center; }
          .xsell-img img { width: 100%; height: 100%; object-fit: contain; transition: transform 0.4s ease; }
          .xsell-card:hover .xsell-img img { transform: scale(1.03); }
          .xsell-price { font-family: StyreneA, sans-serif; font-size: 13px; font-weight: 500; margin: 0 0 4px; color: #000; }
          .xsell-name { font-family: StyreneA, sans-serif; font-size: 12px; color: #000; margin: 0 0 4px; line-height: 1.35; min-height: 32px; }
          .xsell-cat { font-family: StyreneA, sans-serif; font-size: 11px; color: rgba(0,0,0,0.45); margin: 0; text-transform: uppercase; letter-spacing: 0.04em; }
          /* Second grid (Te puede interesar) shows up to 12 items */
          .xsell-grid-wide { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
          @media (min-width: 640px) { .xsell-grid-wide { grid-template-columns: repeat(3, 1fr); } }
          @media (min-width: 1024px) { .xsell-grid-wide { grid-template-columns: repeat(4, 1fr); gap: 16px; } }
          @media (min-width: 1400px) { .xsell-grid-wide { grid-template-columns: repeat(6, 1fr); } }
        `}</style>

        {/* COMPLETÁ TU EQUIPO — siempre 5 productos */}
        {completeLook.length > 0 && (
          <section className="xsell-section">
            <div className="xsell-header">
              <h2 className="xsell-title">Completá tu equipo</h2>
              <p className="xsell-sub">Productos que se usan junto con este</p>
            </div>
            <div className="xsell-grid">
              {completeLook.map((p) => (
                <a key={p.id} href={`/productos/${p.id}`} className="xsell-card">
                  <button className="xsell-heart" aria-label="Guardar" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>♡</button>
                  <div className="xsell-img">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} />}
                  </div>
                  <p className="xsell-price">{formatPrice(p.reference_price)}</p>
                  <p className="xsell-name">{p.name}</p>
                  <p className="xsell-cat">ARGON</p>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* TAMBIÉN TE PUEDE INTERESAR — 8-12 productos mix */}
        {related.length > 0 && (
          <section className="xsell-section" ref={relatedRef}>
            <div className="xsell-header">
              <h2 className="xsell-title">También te puede interesar</h2>
              <p className="xsell-sub">Otras opciones que podrían encajar</p>
            </div>
            <div className="xsell-grid-wide">
              {related.map((p) => (
                <a key={p.id} href={`/productos/${p.id}`} className="xsell-card">
                  <button className="xsell-heart" aria-label="Guardar" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>♡</button>
                  <div className="xsell-img">
                    {p.images?.[0] && <img src={p.images[0]} alt={p.name} />}
                  </div>
                  <p className="xsell-price">{formatPrice(p.reference_price)}</p>
                  <p className="xsell-name">{p.name}</p>
                  <p className="xsell-cat">ARGON</p>
                </a>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Mobile sticky bar — name + price + add to cart */}
      <div className="pdp-sticky-bar" aria-label="Acciones rápidas">
        <div className="pdp-sticky-info">
          <p className="pdp-sticky-name">{product.name}</p>
          <p className="pdp-sticky-price">{formatPrice(product.reference_price)}</p>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={adding || added}
          className="pdp-sticky-cta"
          style={{ opacity: adding ? 0.5 : 1 }}
        >
          {added ? "✓ Agregado" : adding ? "Agregando..." : "Agregar"}
        </button>
      </div>
      <div className="pdp-bottom-spacer" aria-hidden="true" />

      <Footer />
    </div>
  );
}


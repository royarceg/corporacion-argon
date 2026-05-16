"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { sortSizes } from "@/utils/sortSizes";
import { colorToHex } from "@/utils/colorToHex";
import { formatPrice } from "@/utils/formatPrice";
import { animate } from "animejs";
import { ApiProduct, ApiVariant, productService } from "@/services/productService";
import { useCart } from "@/context/CartContext";
import { siblingService, Sibling } from "@/services/siblingService";

interface Props {
  product: ApiProduct;
  onClose: () => void;
}

export default function QuickViewModal({ product: initialProduct, onClose }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();

  const [current, setCurrent] = useState<ApiProduct>(initialProduct);
  const [variants, setVariants] = useState<ApiVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    initialProduct.colors?.[0] ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [siblings, setSiblings] = useState<Sibling[]>([]);
  const [note, setNote] = useState("");
  const [swapping, setSwapping] = useState(false);

  const colors = current.colors ?? [];
  const sizes = sortSizes(current.sizes ?? []);
  const images = current.images ?? [];

  // Fetch variantes y siblings cada vez que cambia el producto activo
  useEffect(() => {
    setLoadingVariants(true);
    productService.getProductById(current.id)
      .then((detail) => setVariants(detail.variants ?? []))
      .catch(() => setVariants([]))
      .finally(() => setLoadingVariants(false));

    siblingService.getForProduct(current.id)
      .then(setSiblings)
      .catch(() => setSiblings([]));
  }, [current.id]);

  // Swap al hermano dentro del mismo modal
  async function swapToSibling(siblingId: number) {
    setSwapping(true);
    try {
      const detail = await productService.getProductById(siblingId);
      setCurrent({
        id: detail.id, name: detail.name, sku: detail.sku,
        price: detail.price, category: detail.category,
        colors: detail.colors ?? [], sizes: detail.sizes ?? [],
        images: detail.images ?? [],
      } as ApiProduct);
      setSelectedImage(0);
      setSelectedColor(detail.colors?.[0] ?? null);
      setSelectedSize(null);
      setAdded(false);
      setAddError(null);
    } catch { /* */ }
    setSwapping(false);
  }

  // Encontrar el variant_id según color + talla seleccionados
  function resolveVariantId(): number | undefined {
    if (variants.length === 0) return undefined;
    const match = variants.find(
      (v) =>
        (selectedSize ? v.size === selectedSize : true) &&
        (selectedColor ? v.color === selectedColor : true)
    );
    return match?.id;
  }

  // Código de variante a mostrar al cliente
  function resolveSkuVariant(): string | null {
    if (variants.length === 0) return null;
    const match = variants.find(
      (v) =>
        (selectedSize ? v.size === selectedSize : true) &&
        (selectedColor ? v.color === selectedColor : true)
    );
    return match?.sku_variant ?? null;
  }

  const price = formatPrice(current.price);

  async function handleAddToCart() {
    setAdding(true);
    setAddError(null);
    try {
      const variantId = resolveVariantId();
      await addToCart(current.id, qty, variantId, note.trim() || undefined);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
      }, 1500);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "No se pudo agregar al carrito";
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  }

  const skuVariant = resolveSkuVariant();
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlayRef.current) {
      animate(overlayRef.current, { opacity: [0, 1], duration: 300, ease: "outQuad" });
    }
    if (modalRef.current) {
      animate(modalRef.current, {
        opacity: [0, 1], duration: 400, ease: "outExpo",
      });
    }
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          zIndex: 90,
          opacity: 0,
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="qv-modal"
        style={{ opacity: 0 }}
      >
        <style>{`
          .qv-modal { position: fixed; background: #fff; z-index: 100; display: flex; overflow: hidden; }
          /* Desktop (768+): centered modal */
          @media (min-width: 768px) {
            .qv-modal {
              top: 50%; left: 50%;
              transform: translate(-50%, -50%);
              width: min(860px, 92vw);
              max-height: 90vh;
              flex-direction: row;
              border-radius: 4px;
            }
          }
          /* Mobile (<768px): BOTTOM SHEET — slides up from bottom, 90% viewport */
          @media (max-width: 767px) {
            .qv-modal {
              left: 0; right: 0; bottom: 0;
              width: 100vw;
              max-height: 90svh;
              flex-direction: column;
              border-radius: 16px 16px 0 0;
              animation: qv-slide-up 0.3s ease-out;
              padding-bottom: env(safe-area-inset-bottom);
            }
            .qv-modal::before {
              content: "";
              position: absolute;
              top: 8px;
              left: 50%;
              transform: translateX(-50%);
              width: 36px;
              height: 4px;
              background: rgba(0,0,0,0.2);
              border-radius: 2px;
              z-index: 2;
            }
          }
          @keyframes qv-slide-up {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }
          .qv-left { flex: 0 0 auto; display: flex; background: #f5f4f4; overflow: hidden; }
          @media (min-width: 768px) { .qv-left { flex: 0 0 55%; } }
          @media (max-width: 767px) { .qv-left { flex: 0 0 auto; height: 45svh; padding-top: 20px; } }
        `}</style>
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "4px",
            zIndex: 1,
            lineHeight: 0,
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="1.5">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        {/* LEFT — Images */}
        <div className="qv-left">
          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                padding: "16px",
                width: "60px",
                flexShrink: 0,
                overflowY: "auto",
              }}
            >
              {images.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  style={{
                    width: "44px",
                    height: "54px",
                    backgroundColor: "#eae9e9",
                    overflow: "hidden",
                    cursor: "pointer",
                    flexShrink: 0,
                    border: selectedImage === i
                      ? "1.5px solid #000"
                      : "1.5px solid transparent",
                  }}
                >
                  <img
                    src={img}
                    alt={current.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Main image */}
          <div style={{ flex: 1, overflow: "hidden", minHeight: "420px" }}>
            {images[selectedImage] ? (
              <img
                src={images[selectedImage]}
                alt={current.name}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <div style={{ width: "100%", height: "100%" }} />
            )}
          </div>
        </div>

        {/* RIGHT — Info */}
        <div
          style={{
            flex: "0 0 45%",
            padding: "40px 36px 36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            overflowY: "auto",
          }}
        >
          {/* Name + Price */}
          <div>
            <h2
              style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "20px",
                fontWeight: 400,
                color: "#000",
                margin: "0 0 10px 0",
                lineHeight: 1.3,
                letterSpacing: "-0.01em",
                paddingRight: "20px",
              }}
            >
              {current.name}
            </h2>
            <p
              style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#000",
                margin: 0,
              }}
            >
              {price}
            </p>
          </div>

          {/* Color */}
          {colors.length > 0 && (
            <div>
              <p
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "12px",
                  fontWeight: 500,
                  color: "#000",
                  margin: "0 0 3px 0",
                }}
              >
                Color: <span style={{ fontWeight: 400 }}>{selectedColor}</span>
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "8px" }}>
                {colors.map((color) => (
                  <button
                    key={color}
                    title={color}
                    onClick={() => { setSelectedColor(color); setSelectedSize(null); }}
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      backgroundColor: colorToHex(color),
                      border:
                        selectedColor === color
                          ? "2px solid #000"
                          : "1px solid rgba(0,0,0,0.2)",
                      cursor: "pointer",
                      padding: 0,
                      outline: "none",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Siblings — otros colores del mismo producto */}
          {siblings.length > 0 && (
            <div>
              <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#000", margin: "0 0 8px 0" }}>
                También disponible en:
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {siblings.map((s) => (
                  <button
                    key={s.id}
                    title={s.name}
                    disabled={swapping}
                    onClick={() => swapToSibling(s.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 12px",
                      border: "1px solid rgba(0,0,0,0.15)",
                      background: "#fff",
                      cursor: "pointer",
                      fontFamily: "StyreneA, sans-serif",
                      fontSize: "11px",
                      color: "#000",
                    }}
                  >
                    {s.image && (
                      <img src={s.image} alt={s.color ?? ""} style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "2px", backgroundColor: "#f5f4f4" }} />
                    )}
                    {s.color && (
                      <span style={{
                        width: "14px", height: "14px", borderRadius: "50%",
                        backgroundColor: colorToHex(s.color),
                        border: "1px solid rgba(0,0,0,0.2)",
                        flexShrink: 0,
                      }} />
                    )}
                    <span>{s.color || s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          {sizes.length > 0 && (
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginBottom: "10px",
                }}
              >
                <p
                  style={{
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#000",
                    margin: 0,
                  }}
                >
                  Talla:
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() =>
                      setSelectedSize((prev) => (prev === size ? null : size))
                    }
                    style={{
                      fontFamily: "StyreneA, sans-serif",
                      fontSize: "12px",
                      color: selectedSize === size ? "#fff" : "#000",
                      backgroundColor: selectedSize === size ? "#000" : "#fff",
                      border: "1px solid rgba(0,0,0,0.25)",
                      padding: "6px 12px",
                      cursor: "pointer",
                      minWidth: "40px",
                      textAlign: "center",
                      transition: "all 0.1s ease",
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Código de variante */}
              {!loadingVariants && skuVariant && (
                <p style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "11px",
                  color: "rgba(0,0,0,0.45)",
                  margin: "10px 0 0 0",
                  letterSpacing: "0.04em",
                }}>
                  Código: <span style={{ color: "#000", fontWeight: 500 }}>{skuVariant}</span>
                </p>
              )}
            </div>
          )}

          {/* Cantidad */}
          <div>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "12px", fontWeight: 500, color: "#000", margin: "0 0 8px 0" }}>Cantidad:</p>
            <div style={{ display: "flex", alignItems: "center", gap: "0" }}>
              <button onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: "32px", height: "32px", border: "1px solid rgba(0,0,0,0.15)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
              <input type="number" min="1" value={qty} onChange={(e) => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 1) setQty(v); }}
                style={{ width: "50px", height: "32px", border: "1px solid rgba(0,0,0,0.15)", borderLeft: "none", borderRight: "none", textAlign: "center", fontFamily: "StyreneA, sans-serif", fontSize: "13px", outline: "none", MozAppearance: "textfield" } as React.CSSProperties} />
              <button onClick={() => setQty(qty + 1)} style={{ width: "32px", height: "32px", border: "1px solid rgba(0,0,0,0.15)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              </button>
            </div>
          </div>

          {/* Add to Bag */}
          <button
            onClick={handleAddToCart}
            disabled={adding}
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "13px",
              fontWeight: 500,
              color: "#fff",
              backgroundColor: added
                ? "#3a6b3a"
                : adding
                ? "rgba(0,0,0,0.4)"
                : "#000",
              border: "none",
              padding: "14px",
              cursor: adding ? "not-allowed" : "pointer",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              transition: "background-color 0.2s",
              marginTop: "4px",
            }}
          >
            {added ? "✓ Agregado" : adding ? "Agregando..." : "Agregar al Carrito"}
          </button>

          {/* Add error */}
          {addError && (
            <p style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "12px",
              color: "#9c2121",
              margin: "-12px 0 0 0",
            }}>
              {addError}
            </p>
          )}

          {/* View Full Details */}
          <a
            href={`/productos/${current.id}`}
            onClick={onClose}
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "13px",
              color: "#000",
              textDecoration: "underline",
              marginTop: "-8px",
            }}
          >
            Ver Detalle Completo
          </a>

          {/* Nota / Comentarios */}
          <div style={{ marginTop: "4px" }}>
            <p style={{ fontFamily: "StyreneA, sans-serif", fontSize: "11px", fontWeight: 500, color: "rgba(0,0,0,0.5)", margin: "0 0 6px 0", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Nota o especificación
            </p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ej: bordado con logo, color especial, cantidad exacta..."
              rows={3}
              style={{
                width: "100%",
                fontFamily: "StyreneA, sans-serif",
                fontSize: "12px",
                color: "#000",
                border: "1px solid rgba(0,0,0,0.15)",
                padding: "10px 12px",
                outline: "none",
                resize: "vertical",
                boxSizing: "border-box",
                lineHeight: 1.5,
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}


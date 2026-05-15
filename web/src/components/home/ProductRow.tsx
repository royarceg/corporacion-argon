import Image from "next/image";

const products = [
  { name: "CHALECO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101299/productos/CHA-01-2.png", href: "/productos/98" },
  { name: "BOTELLA ACERO INOX", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101267/productos/BOT-03-2.png", href: "/productos/88" },
  { name: "CASCO MOTORIZADO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101291/productos/CAS-01-2.png", href: "/productos/93" },
  { name: "CADENA PIÑONES MOTO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101279/productos/CAD-SPRO-2.png", href: "/productos/125" },
  { name: "BOTIN BEIGE", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101433/productos/ZAP-01.png", href: "/productos/7" },
];

export default function ProductRow() {
  return (
    <>
    <style>{`
      .cta-cotizar {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: StyreneA, sans-serif;
        font-size: 10px;
        font-weight: 400;
        letter-spacing: 2.5px;
        text-transform: uppercase;
        color: #888;
        text-decoration: none;
        transition: color .2s;
      }
      .cta-cotizar span {
        display: inline-block;
        transition: transform .2s, color .2s;
        color: #aaa;
      }
      .cta-cotizar:hover { color: #000; }
      .cta-cotizar:hover span { color: #000; transform: translateX(3px); }
    `}</style>
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "48px",
      }}
    >
      {/* Title frame */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          padding: "16px 0",
        }}
      >
        <h2
          style={{
            fontFamily: "StyreneA, sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#000000",
            margin: 0,
          }}
        >
          Lo Que Necesitas Ahora
        </h2>
      </div>

      {/* 5 Product cards */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          display: "flex",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {products.map((product) => (
          <div
            key={product.name}
            style={{
              width: "251px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "13px",
            }}
          >
            {/* Product image */}
            <a
              href={product.href}
              style={{
                display: "block",
                width: "251px",
                height: "279px",
                borderRadius: "4px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src={product.img}
                alt={product.name}
                fill
                className="object-cover"
                sizes="251px"
              />
            </a>
            {/* Detail frame */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <p
                style={{
                  fontFamily: "StyreneA, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#000000",
                  margin: 0,
                }}
              >
                {product.name}
              </p>
              <a href={product.href} className="cta-cotizar">
                Cotizar ya <span>→</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
    </>
  );
}

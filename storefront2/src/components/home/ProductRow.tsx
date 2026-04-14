import Image from "next/image";

const products = [
  { name: "GORRO CHAVITO PROTECTOR AZUL", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101345/productos/GOC-01.png" },
  { name: "NEUMÁTICO 21\"", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101379/productos/NEU-21.png" },
  { name: "PANTALÓN HOMBRE AZUL OSCURO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101388/productos/PAN-02.png" },
  { name: "CADENA PIÑONES MOTO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101278/productos/CAD-SPRO.png" },
  { name: "PARCHE K-9 LETRAS", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101403/productos/PCH-04.png" },
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
            <div
              style={{
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
            </div>
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
              <a href="/productos" className="cta-cotizar">
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

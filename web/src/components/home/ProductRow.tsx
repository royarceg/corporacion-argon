import Image from "next/image";

const products = [
  { name: "BUJIAS PARA XRE300", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101268/productos/BUJ-XRE300.png", href: "/productos/130" },
  { name: "KIT PIÑONES MOTO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1777005459/products/images/hiexuqzbexpor3eumb71.png", href: "/productos/127" },
  { name: "CASCO MOTORIZADO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101291/productos/CAS-01-2.png", href: "/productos/93" },
  { name: "CADENA PIÑONES MOTO", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101279/productos/CAD-SPRO-2.png", href: "/productos/125" },
  { name: "BOTIN BEIGE", img: "https://res.cloudinary.com/dj0i57kxn/image/upload/v1776101433/productos/ZAP-01.png", href: "/productos/7" },
];

export default function ProductRow() {
  return (
    <>
      <style>{`
        .pr-section { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); display: flex; flex-direction: column; align-items: stretch; gap: clamp(24px, 4vw, 48px); }
        .pr-title-frame { width: 100%; padding: 16px 0; }
        .pr-title { font-family: StyreneA, sans-serif; font-size: clamp(16px, 2.2vw, 18px); font-weight: 400; color: #000; margin: 0; }
        .pr-grid { width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(12px, 2.5vw, 20px); }
        @media (min-width: 640px) { .pr-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .pr-grid { grid-template-columns: repeat(5, 1fr); } }
        .pr-card { display: flex; flex-direction: column; gap: 13px; min-width: 0; }
        .pr-img-link { display: block; width: 100%; aspect-ratio: 251/279; border-radius: 4px; overflow: hidden; position: relative; background: #f5f4f4; }
        .pr-detail { display: flex; flex-direction: column; gap: 3px; align-items: center; text-align: center; }
        .pr-name { font-family: StyreneA, sans-serif; font-size: clamp(11px, 1.5vw, 13px); font-weight: 400; color: #000; margin: 0; overflow-wrap: anywhere; }
        .cta-cotizar { display: inline-flex; align-items: center; gap: 6px; font-family: StyreneA, sans-serif; font-size: 10px; font-weight: 400; letter-spacing: 2.5px; text-transform: uppercase; color: #888; text-decoration: none; transition: color .2s; }
        .cta-cotizar span { display: inline-block; transition: transform .2s, color .2s; color: #aaa; }
        .cta-cotizar:hover { color: #000; }
        .cta-cotizar:hover span { color: #000; transform: translateX(3px); }
      `}</style>
      <section className="pr-section">
        <div className="pr-title-frame">
          <h2 className="pr-title">Lo Que Necesitas Ahora</h2>
        </div>

        <div className="pr-grid">
          {products.map((product) => (
            <div key={product.name} className="pr-card">
              <a href={product.href} className="pr-img-link">
                <Image src={product.img} alt={product.name} fill className="object-cover" sizes="(min-width: 1024px) 251px, (min-width: 640px) 33vw, 50vw" />
              </a>
              <div className="pr-detail">
                <p className="pr-name">{product.name}</p>
                <a href={product.href} className="cta-cotizar">Cotizar ya <span>→</span></a>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

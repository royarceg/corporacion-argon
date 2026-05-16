import Image from "next/image";

const collections = [
  { title: "Novedades", href: "/producto/acceso", img: "/images/web/banner-collection-03.svg" },
  { title: "Colección Laboral", href: "/producto/acceso", img: "/images/web/banner-collection-02.svg" },
  { title: "Más Vendidos", href: "/producto/acceso", img: "/images/web/banner-collection-01.svg" },
];

export default function CollectionBanners() {
  return (
    <>
      <style>{`
        .cb-section { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); display: flex; flex-direction: column; align-items: stretch; gap: clamp(24px, 4vw, 48px); }
        .cb-intro { padding: 16px 0; }
        .cb-text { font-family: StyreneA, sans-serif; font-size: clamp(14px, 2vw, 18px); font-weight: 400; color: #000; margin: 0; line-height: 1.5; max-width: 1304px; }
        .cb-grid { width: 100%; display: grid; grid-template-columns: 1fr; gap: clamp(12px, 2.5vw, 20px); }
        @media (min-width: 768px) { .cb-grid { grid-template-columns: repeat(3, 1fr); } }
        .cb-card { aspect-ratio: 432/532; border-radius: 8px; overflow: hidden; position: relative; display: block; text-decoration: none; }
        @media (max-width: 767px) { .cb-card { aspect-ratio: 16/10; } }
        .cb-card-title { position: absolute; bottom: 24px; left: 24px; font-family: StyreneA, sans-serif; font-size: clamp(16px, 2vw, 18px); font-weight: 400; color: #fff; z-index: 1; }
      `}</style>
      <section className="cb-section">
        <div className="cb-intro">
          <p className="cb-text">Equipamos a los equipos que hacen posible el trabajo. Uniformes, calzado y protección con calidad que dura.</p>
        </div>
        <div className="cb-grid">
          {collections.map((col) => (
            <a key={col.title} href={col.href} className="cb-card">
              <Image src={col.img} alt={col.title} fill className="object-cover" sizes="(min-width: 768px) 33vw, 100vw" />
              <span className="cb-card-title">{col.title}</span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

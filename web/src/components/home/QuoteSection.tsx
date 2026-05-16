const cards = [
  { img: "/images/web/banner-guantes.jpg", label: "Protección personal", title: ["Guantes", "e Higiene"], href: "/productos?cat=HIGIENE" },
  { img: "/images/web/banner-uniforme.jpg", label: "Ropa laboral", title: ["Uniformes", "Corporativos"], href: "/productos?cat=UNIFORME" },
  { img: "/images/web/banner-bujias.jpg", label: "Movilidad", title: ["Accesorios", "para Moto"], href: "/productos?cat=MOTOCICLETA" },
  { img: "/images/web/banner-bulto.jpg", label: "Equipamiento", title: ["Artículos", "Promocionales"], href: "/productos?cat=PROMOCIONALES" },
];

export default function QuoteSection() {
  return (
    <>
      <style>{`
        .qs-section { width: 100%; max-width: 1400px; margin: 0 auto; overflow: hidden; }
        .qs-grid { display: grid; grid-template-columns: 1fr 1fr; }
        @media (min-width: 1024px) { .qs-grid { display: flex; height: 480px; } }
        .qs-card { position: relative; display: flex; flex-direction: column; justify-content: flex-end; padding: clamp(20px, 3vw, 28px) clamp(16px, 2.5vw, 24px); overflow: hidden; text-decoration: none; aspect-ratio: 1/1.1; }
        @media (min-width: 768px) { .qs-card { aspect-ratio: 16/10; } }
        @media (min-width: 1024px) { .qs-card { aspect-ratio: auto; flex: 1; transition: flex 0.4s ease; height: 480px; } }
        @media (min-width: 1024px) { .qs-card:hover { flex: 1.6; } }
        .qs-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; pointer-events: none; transition: transform 0.5s ease; }
        @media (min-width: 1024px) { .qs-card:hover .qs-img { transform: scale(1.05); } }
        .qs-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%); pointer-events: none; }
        .qs-arrow { position: absolute; top: clamp(14px, 2vw, 24px); right: clamp(14px, 2vw, 24px); width: 32px; height: 32px; border: 1px solid rgba(255,255,255,0.4); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.7); font-size: 14px; z-index: 1; }
        .qs-label { font-family: StyreneA, sans-serif; font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: rgba(255,255,255,0.6); position: relative; z-index: 1; margin: 0 0 8px; }
        .qs-title { font-family: StyreneA, sans-serif; font-size: clamp(16px, 2.4vw, 20px); font-weight: 400; color: #fff; line-height: 1.2; position: relative; z-index: 1; margin: 0; }
      `}</style>
      <section className="qs-section">
        <div className="qs-grid">
          {cards.map((card) => (
            <a key={card.label} href={card.href} className="qs-card">
              <img src={card.img} alt={card.label} className="qs-img" />
              <div className="qs-overlay" />
              <span className="qs-arrow">↗</span>
              <p className="qs-label">{card.label}</p>
              <p className="qs-title">{card.title[0]}<br />{card.title[1]}</p>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}

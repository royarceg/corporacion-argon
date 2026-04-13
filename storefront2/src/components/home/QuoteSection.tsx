const cards = [
  { img: "/images/web/banner-guantes.jpg", label: "Protección personal", title: ["Guantes", "y Equipo"], href: "/productos" },
  { img: "/images/web/banner-uniforme.jpg", label: "Ropa laboral", title: ["Uniformes", "Corporativos"], href: "/productos" },
  { img: "/images/web/banner-bujias.jpg", label: "Movilidad", title: ["Accesorios", "para Moto"], href: "/productos" },
  { img: "/images/web/banner-bulto.jpg", label: "Equipamiento", title: ["Bolsos", "y Mochilas"], href: "/productos" },
];

export default function QuoteSection() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        overflow: "hidden",
      }}
    >
      <style>{`
        .quote-card { flex: 1; transition: flex 0.4s ease; }
        .quote-card:hover { flex: 1.6; }
        .quote-card .quote-img { transition: transform 0.5s ease; }
        .quote-card:hover .quote-img { transform: scale(1.05); }
      `}</style>

      <div style={{ display: "flex", height: "480px" }}>
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="quote-card"
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "28px 24px",
              overflow: "hidden",
              textDecoration: "none",
            }}
          >
            {/* Photo background */}
            <img
              src={card.img}
              alt={card.label}
              className="quote-img"
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
              }}
            />

            {/* Dark overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%)",
                pointerEvents: "none",
              }}
            />

            {/* Arrow */}
            <span
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                width: "32px",
                height: "32px",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.7)",
                fontSize: "14px",
                zIndex: 1,
              }}
            >
              ↗
            </span>

            {/* Label */}
            <p
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "10px",
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)",
                position: "relative",
                zIndex: 1,
                margin: "0 0 8px 0",
              }}
            >
              {card.label}
            </p>

            {/* Title */}
            <p
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "20px",
                fontWeight: 400,
                color: "#ffffff",
                lineHeight: 1.2,
                position: "relative",
                zIndex: 1,
                margin: 0,
              }}
            >
              {card.title[0]}
              <br />
              {card.title[1]}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}

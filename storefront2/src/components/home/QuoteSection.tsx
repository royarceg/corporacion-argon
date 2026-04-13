const cards = [
  { bg: "#1a2535", icon: "👟", label: "Seguridad personal", title: ["Calzado", "Táctico"], href: "/productos" },
  { bg: "#2c2c2c", icon: "👔", label: "Ropa laboral", title: ["Uniformes", "Corporativos"], href: "/productos" },
  { bg: "#3d3020", icon: "🦺", label: "Protección", title: ["Chalecos", "y Equipos"], href: "/productos" },
  { bg: "#1c2a20", icon: "🏍️", label: "Movilidad", title: ["Equipo", "para Moto"], href: "/productos" },
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
        .quote-card:hover .quote-icon { opacity: 0.28; }
      `}</style>

      <div style={{ display: "flex", height: "480px" }}>
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="quote-card"
            style={{
              background: card.bg,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              padding: "28px 24px",
              overflow: "hidden",
              textDecoration: "none",
            }}
          >
            {/* Big icon */}
            <span
              className="quote-icon"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -60%)",
                fontSize: "80px",
                opacity: 0.18,
                pointerEvents: "none",
                userSelect: "none",
                transition: "opacity 0.3s",
              }}
            >
              {card.icon}
            </span>

            {/* Arrow */}
            <span
              style={{
                position: "absolute",
                top: "24px",
                right: "24px",
                width: "32px",
                height: "32px",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                fontSize: "14px",
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
                color: "rgba(255,255,255,0.4)",
                marginBottom: "8px",
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

const props = [
  {
    tag: "CALIDAD CERTIFICADA",
    title: "Materiales que duran",
    desc: "Cada producto pasa por control de calidad estricto. Materiales resistentes al desgaste, la humedad y el uso diario intensivo.",
  },
  {
    tag: "PERSONALIZACIÓN",
    title: "Con tu logo y marca",
    desc: "Uniformes y artículos promocionales con bordado o estampado de tu empresa. Pedidos corporativos desde 10 unidades.",
  },
  {
    tag: "ENTREGA NACIONAL",
    title: "Enviamos a todo el país",
    desc: "Despacho rápido a cualquier provincia. Coordinamos con tu equipo de compras para pedidos institucionales.",
  },
];

export default function ValueProps() {
  return (
    <div className="px-2.5" style={{ paddingTop: "10px", paddingBottom: "10px" }}>
      <div className="flex gap-2.5">
        {props.map((p) => (
          <div
            key={p.tag}
            className="flex-1 flex flex-col gap-3"
            style={{
              background: "var(--color-white)",
              borderRadius: "16px",
              padding: "32px",
              height: "220px",
            }}
          >
            <span
              style={{
                fontFamily: "AkkuratMono, monospace",
                fontSize: "12px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "1.2px",
                color: "var(--color-charcoal)",
                lineHeight: "16px",
              }}
            >
              {p.tag}
            </span>
            <h3
              style={{
                fontFamily: "Nantes, serif",
                fontSize: "28px",
                fontWeight: 400,
                color: "var(--color-charcoal)",
                lineHeight: "36px",
                margin: 0,
              }}
            >
              {p.title}
            </h3>
            <p
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "14px",
                fontWeight: 400,
                color: "var(--color-light-charcoal)",
                lineHeight: "21px",
                margin: 0,
              }}
            >
              {p.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

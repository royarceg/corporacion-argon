const columns = [
  {
    slug: "uniformes",
    tag: "ROPA LABORAL",
    title: "Uniformes K-9",
    ctaPrimary: "Explorar",
    ctaSecondary: "Ver más",
    placeholder: "627×895px\nfoto: COL-01 lifestyle\npersona vistiendo camisa K-9",
    bg: "#8a7e6e",
  },
  {
    slug: "botas",
    tag: "CALZADO DE SEGURIDAD",
    title: "Botas Tácticas",
    ctaPrimary: "Explorar",
    ctaSecondary: "Ver más",
    placeholder: "627×895px\nfoto: ZAP-02 lifestyle\nbota en campo/terreno",
    bg: "#6e7a6a",
  },
  {
    slug: "proteccion",
    tag: "EQUIPAMIENTO",
    title: "Chalecos y Protección",
    ctaPrimary: "Explorar",
    ctaSecondary: "Ver más",
    placeholder: "627×895px\nfoto: CHT-01 lifestyle\nchaleco táctico puesto",
    bg: "#5e6e7a",
  },
];

export default function ThreeColumnSection() {
  return (
    <div className="px-2.5 py-2.5">
      <div className="flex gap-2.5">
        {columns.map((col) => (
          <div
            key={col.slug}
            className="relative flex-1 overflow-hidden"
            style={{ height: "895px", borderRadius: "16px", background: col.bg }}
          >
            {/* Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-dashed border-white/30 rounded-lg p-6 text-center mx-8">
                <p
                  style={{
                    fontFamily: "AkkuratMono, monospace",
                    fontSize: "10px",
                    color: "rgba(255,255,255,0.55)",
                    whiteSpace: "pre-line",
                    letterSpacing: "0.5px",
                    lineHeight: "1.6",
                  }}
                >
                  {col.placeholder}
                </p>
              </div>
            </div>

            {/* Bottom overlay */}
            <div
              className="absolute bottom-0 left-0 right-0 flex flex-col gap-4 p-8 z-10"
              style={{
                background: "linear-gradient(to top, rgba(0,0,0,0.45) 0%, transparent 100%)",
                paddingTop: "80px",
              }}
            >
              <div className="flex flex-col gap-2">
                <span
                  style={{
                    fontFamily: "AkkuratMono, monospace",
                    fontSize: "10px",
                    fontWeight: 400,
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    color: "rgba(255,255,255,0.8)",
                    lineHeight: "14px",
                  }}
                >
                  {col.tag}
                </span>
                <p
                  style={{
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "white",
                    letterSpacing: "0.3px",
                    lineHeight: "20px",
                    margin: 0,
                  }}
                >
                  {col.title}
                </p>
              </div>

              <div className="flex gap-2">
                <a
                  href={`/${col.slug}`}
                  style={{
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    color: "var(--color-charcoal)",
                    background: "var(--color-white)",
                    borderRadius: "9999px",
                    padding: "6px 16px",
                    height: "33px",
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                  }}
                >
                  {col.ctaPrimary}
                </a>
                <a
                  href={`/${col.slug}`}
                  style={{
                    fontFamily: "Graphik, sans-serif",
                    fontSize: "12px",
                    fontWeight: 500,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    color: "white",
                    background: "transparent",
                    borderRadius: "9999px",
                    padding: "6px 16px",
                    height: "33px",
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                    border: "1px solid rgba(255,255,255,0.6)",
                  }}
                >
                  {col.ctaSecondary}
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

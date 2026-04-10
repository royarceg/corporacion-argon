export default function HeroPromoBanner() {
  return (
    <div
      className="flex flex-col items-center justify-center text-center"
      style={{
        background: "var(--color-hero-blue)",
        padding: "48px 60px",
      }}
    >
      <h1
        style={{
          fontFamily: "SelfModern, serif",
          fontSize: "40px",
          fontWeight: 700,
          lineHeight: "50px",
          color: "var(--color-white)",
          marginBottom: "12px",
        }}
      >
        Equipamiento que resiste cualquier condición
      </h1>
      <p
        style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          lineHeight: "21px",
          letterSpacing: "0.35px",
          color: "var(--color-white)",
        }}
      >
        Uniformes, botas de seguridad y equipamiento táctico K9 para profesionales
      </p>
    </div>
  );
}

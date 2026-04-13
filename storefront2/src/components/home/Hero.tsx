export default function Hero() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        height: "712px",
        backgroundColor: "#000000",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        overflow: "hidden",
      }}
    >
      {/* Hero background video */}
      <video
        src="/images/web/hero-collection-01.mp4"
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
        }}
      />

      {/* Content overlay */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          maxWidth: "1272px",
        }}
      >
        <h1
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "24px",
            fontWeight: 400,
            color: "#ffffff",
            lineHeight: 1.5,
            margin: 0,
            whiteSpace: "pre-line",
          }}
        >
          {"Equipa a tu equipo.\nUniformes y protección de alto rendimiento."}
        </h1>

        <a
          href="/producto/acceso"
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "15px",
            fontWeight: 400,
            color: "#000000",
            backgroundColor: "#f8f9fa",
            width: "116px",
            height: "42px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            textDecoration: "none",
          }}
        >
          Comprar Ya
        </a>
      </div>
    </section>
  );
}

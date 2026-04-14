export default function AnnouncementBar() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        height: "44px",
        backgroundColor: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
      }}
    >
      <p
        style={{
          fontFamily: "StyreneA, sans-serif",
          fontSize: "11px",
          fontWeight: 400,
          color: "#ffffff",
          margin: 0,
          letterSpacing: "0.3px",
        }}
      >
        Insumos y Uniformes para empresas · Envíos a todo el país · ¡Solicita tu cotización gratis!
      </p>
    </div>
  );
}

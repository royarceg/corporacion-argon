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
          fontFamily: "Graphik, sans-serif",
          fontSize: "11px",
          fontWeight: 400,
          color: "#ffffff",
          margin: 0,
          letterSpacing: "0.3px",
        }}
      >
        Complimentary U.S. No-Rush Shipping on orders of $50+
      </p>
    </div>
  );
}

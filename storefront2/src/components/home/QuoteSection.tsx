export default function QuoteSection() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        height: "443px",
        backgroundColor: "#f5f4f4",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "47px",
        padding: "0 32px",
      }}
    >
      <h2
        style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "24px",
          fontWeight: 400,
          color: "#000000",
          margin: 0,
          textAlign: "center",
          lineHeight: 1.3,
        }}
      >
        The Art of Fewer, Better Choices
      </h2>
      <p
        style={{
          fontFamily: "Graphik, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          color: "#000000",
          lineHeight: 1.6,
          margin: 0,
          maxWidth: "720px",
          textAlign: "center",
        }}
      >
        Opting for quality over quantity means selecting timeless, durable, and
        responsibly made items. This approach simplifies our lives and fosters a
        deeper appreciation for our surroundings. Emphasizing longevity and
        responsible production resonates with a more sustainable and mindful
        lifestyle.
      </p>
    </section>
  );
}

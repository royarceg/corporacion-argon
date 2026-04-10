const videos = [
  "/images/web/gallery-product-01.mp4",
  "/images/web/gallery-product-02.mp4",
  "/images/web/gallery-product-03.mp4",
  "/images/web/gallery-product-04.mp4",
  "/images/web/gallery-product-05.mp4",
];

export default function ImageGallery() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 32px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "48px",
      }}
    >
      {/* Title */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          padding: "16px 0 0 0",
        }}
      >
        <h2
          style={{
            fontFamily: "Graphik, sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#000000",
            margin: 0,
          }}
        >
          Our Products
        </h2>
      </div>

      {/* 5 product videos */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          display: "flex",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {videos.map((src, index) => (
          <div
            key={index}
            style={{
              width: "251px",
              height: "251px",
              borderRadius: "4px",
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <video
              src={src}
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";

const photos = [
  { src: "/images/web/banner-guantes.jpg", alt: "Guantes de protección" },
  { src: "/images/web/banner-uniforme.jpg", alt: "Uniforme de trabajo" },
  { src: "/images/web/banner-bujias.jpg", alt: "Bujías DENSO" },
  { src: "/images/web/banner-bulto.jpg", alt: "Bolso / mochila" },
];

export default function ImageGallery() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "80px 32px 0 32px",
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
          Nuestros Productos
        </h2>
      </div>

      {/* 4 product photos */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          display: "flex",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              height: "320px",
              borderRadius: "4px",
              overflow: "hidden",
              flexShrink: 0,
              position: "relative",
            }}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1400px) 25vw, 320px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

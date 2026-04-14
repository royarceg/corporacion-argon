import Image from "next/image";

const collections = [
  { title: "Novedades", href: "/producto/acceso", img: "/images/web/banner-collection-03.svg" },
  { title: "Colección Laboral", href: "/producto/acceso", img: "/images/web/banner-collection-02.svg" },
  { title: "Más Vendidos", href: "/producto/acceso", img: "/images/web/banner-collection-01.svg" },
];

export default function CollectionBanners() {
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
      <div style={{ width: "1336px", maxWidth: "100%", padding: "16px 0" }}>
        <p
          style={{
            fontFamily: "StyreneA, sans-serif",
            fontSize: "18px",
            fontWeight: 400,
            color: "#000000",
            margin: 0,
            lineHeight: 1.5,
            maxWidth: "1304px",
          }}
        >
          Equipamos a los equipos que hacen posible el trabajo. Uniformes, calzado y protección con calidad que dura.
        </p>
      </div>

      {/* 3 Collection cards */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          display: "flex",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {collections.map((col) => (
          <a
            key={col.title}
            href={col.href}
            style={{
              width: "432px",
              height: "532px",
              borderRadius: "8px",
              overflow: "hidden",
              position: "relative",
              display: "block",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <Image
              src={col.img}
              alt={col.title}
              fill
              className="object-cover"
              sizes="432px"
            />
            <span
              style={{
                position: "absolute",
                bottom: "24px",
                left: "24px",
                fontFamily: "StyreneA, sans-serif",
                fontSize: "18px",
                fontWeight: 400,
                color: "#ffffff",
                zIndex: 1,
              }}
            >
              {col.title}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

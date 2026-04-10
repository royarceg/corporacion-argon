import Image from "next/image";

const banners = [
  { title: "The Smart Chic", href: "/producto/acceso", img: "/images/web/banner-two-col-01.svg" },
  { title: "Ready To Go", href: "/producto/acceso", img: "/images/web/banner-two-col-02.svg" },
];

export default function TwoColumnBanners() {
  return (
    <section
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 32px",
        display: "flex",
        gap: "20px",
        justifyContent: "center",
      }}
    >
      {banners.map((banner) => (
        <a
          key={banner.title}
          href={banner.href}
          style={{
            width: "658px",
            height: "719px",
            borderRadius: "8px",
            overflow: "hidden",
            position: "relative",
            display: "block",
            textDecoration: "none",
            flexShrink: 0,
          }}
        >
          <Image
            src={banner.img}
            alt={banner.title}
            fill
            className="object-cover"
            sizes="658px"
          />
          <span
            style={{
              position: "absolute",
              bottom: "32px",
              left: "32px",
              fontFamily: "Graphik, sans-serif",
              fontSize: "18px",
              fontWeight: 400,
              color: "#ffffff",
              zIndex: 1,
            }}
          >
            {banner.title}
          </span>
        </a>
      ))}
    </section>
  );
}

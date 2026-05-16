import Image from "next/image";

const banners = [
  { title: "CHALECO REFLECTIVO", href: "/producto/acceso", img: "/images/web/banner-two-col-01.svg" },
  { title: "VASO ACERO INOX", href: "/producto/acceso", img: "/images/web/banner-two-col-02.svg" },
];

export default function TwoColumnBanners() {
  return (
    <>
      <style>{`
        .tcb-section { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); display: grid; grid-template-columns: 1fr; gap: clamp(12px, 2.5vw, 20px); }
        @media (min-width: 768px) { .tcb-section { grid-template-columns: repeat(2, 1fr); } }
        .tcb-card { aspect-ratio: 658/719; border-radius: 8px; overflow: hidden; position: relative; display: block; text-decoration: none; }
        @media (max-width: 767px) { .tcb-card { aspect-ratio: 4/5; } }
        .tcb-title { position: absolute; bottom: clamp(20px, 3vw, 32px); left: clamp(20px, 3vw, 32px); font-family: StyreneA, sans-serif; font-size: clamp(16px, 2vw, 18px); font-weight: 400; color: #fff; z-index: 1; }
      `}</style>
      <section className="tcb-section">
        {banners.map((banner) => (
          <a key={banner.title} href={banner.href} className="tcb-card">
            <Image src={banner.img} alt={banner.title} fill className="object-cover" sizes="(min-width: 768px) 50vw, 100vw" />
            <span className="tcb-title">{banner.title}</span>
          </a>
        ))}
      </section>
    </>
  );
}

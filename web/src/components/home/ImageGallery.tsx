const videos = [
  "/images/web/gallery-product-01.mp4",
  "/images/web/gallery-product-02.mp4",
  "/images/web/gallery-product-03.mp4",
  "/images/web/gallery-product-04.mp4",
  "/images/web/gallery-product-05.mp4",
];

export default function ImageGallery() {
  return (
    <>
      <style>{`
        .ig-section { width: 100%; max-width: 1400px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); display: flex; flex-direction: column; align-items: stretch; gap: clamp(24px, 4vw, 48px); }
        .ig-title-frame { padding: 16px 0 0; }
        .ig-title { font-family: StyreneA, sans-serif; font-size: clamp(16px, 2.2vw, 18px); font-weight: 400; color: #000; margin: 0; }
        .ig-grid { width: 100%; display: grid; grid-template-columns: repeat(2, 1fr); gap: clamp(12px, 2.5vw, 20px); }
        @media (min-width: 640px) { .ig-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .ig-grid { grid-template-columns: repeat(5, 1fr); } }
        .ig-item { aspect-ratio: 1/1; border-radius: 4px; overflow: hidden; background: #f5f4f4; }
        .ig-item video { width: 100%; height: 100%; object-fit: cover; }
      `}</style>
      <section className="ig-section">
        <div className="ig-title-frame">
          <h2 className="ig-title">Nuestros Productos</h2>
        </div>
        <div className="ig-grid">
          {videos.map((src, index) => (
            <div key={index} className="ig-item">
              <video src={src} autoPlay muted loop playsInline />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

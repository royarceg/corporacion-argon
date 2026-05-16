export default function Hero() {
  return (
    <>
      <style>{`
        .hero-section {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          height: clamp(420px, 75svh, 712px);
          background-color: #000;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 20px;
          overflow: hidden;
        }
        .hero-video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .hero-content { position: relative; z-index: 1; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 20px; max-width: 1272px; padding: 0 clamp(16px, 4vw, 32px); }
        .hero-title { font-family: StyreneA, sans-serif; font-weight: 400; color: #fff; line-height: 1.35; margin: 0; white-space: pre-line; font-size: clamp(18px, 3.4vw, 24px); }
        .hero-cta { font-family: StyreneA, sans-serif; font-size: 15px; font-weight: 400; color: #000; background-color: #f8f9fa; min-width: 140px; min-height: 44px; display: inline-flex; align-items: center; justify-content: center; gap: 10px; text-decoration: none; padding: 0 20px; }
      `}</style>
      <section className="hero-section">
        <video src="/images/web/hero-collection-01.mp4" autoPlay muted loop playsInline className="hero-video" />
        <div className="hero-content">
          <h1 className="hero-title">{"Equipa a tu equipo.\nUniformes y protección de alto rendimiento."}</h1>
          <a href="/productos" className="hero-cta">Comprar Ya</a>
        </div>
      </section>
    </>
  );
}

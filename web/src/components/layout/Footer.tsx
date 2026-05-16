export default function Footer() {
  return (
    <>
      <style>{`
        .ft { width: 100%; max-width: 1400px; margin: 0 auto; background-color: #f5f4f4; padding: clamp(40px, 6vw, 60px) clamp(16px, 4vw, 32px) clamp(28px, 4vw, 40px); }
        .ft-main { display: grid; grid-template-columns: 1fr; gap: clamp(28px, 4vw, 25px); }
        @media (min-width: 768px) { .ft-main { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1024px) { .ft-main { grid-template-columns: repeat(4, 1fr); gap: 25px; } }
        .ft-col-title { font-family: StyreneA, sans-serif; font-size: 11px; font-weight: 400; text-transform: uppercase; letter-spacing: 0.8px; color: #565656; margin-bottom: 16px; }
        .ft-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
        .ft-item, .ft-link { font-family: StyreneA, sans-serif; font-size: 13px; font-weight: 400; color: #000; text-decoration: none; }
        .ft-newsletter { max-width: 491px; }
        @media (min-width: 1024px) { .ft-newsletter { grid-column: span 2; } }
        @media (min-width: 1280px) { .ft-newsletter { grid-column: auto; } }
        .ft-newsletter-title { font-family: StyreneA, sans-serif; font-size: clamp(15px, 1.8vw, 16px); font-weight: 400; color: #000; margin-bottom: 16px; }
        .ft-newsletter-form { display: flex; gap: 8px; margin-bottom: 12px; flex-wrap: wrap; }
        .ft-input { flex: 1; min-width: 0; height: 44px; padding: 0 12px; font-family: StyreneA, sans-serif; font-size: 16px; color: #565656; border: 1px solid #cccccc; border-radius: 4px; outline: none; background: #fff; }
        @media (min-width: 768px) { .ft-input { font-size: 13px; } }
        .ft-btn { height: 44px; padding: 0 24px; font-family: StyreneA, sans-serif; font-size: 15px; font-weight: 400; color: #fff; background: #000; border: none; border-radius: 4px; cursor: pointer; min-width: 120px; }
        .ft-disclaimer { font-family: StyreneA, sans-serif; font-size: 13px; font-weight: 400; color: #000; margin: 0; line-height: 1.5; }
        .ft-copy { margin-top: clamp(40px, 6vw, 80px); text-align: center; }
        .ft-copy p { font-family: StyreneA, sans-serif; font-size: 13px; color: #565656; margin: 0; }
      `}</style>
      <footer className="ft">
        <div className="ft-main">
          <div>
            <p className="ft-col-title">Contáctanos</p>
            <ul className="ft-list"><li className="ft-item">Escríbenos</li></ul>
          </div>

          <div>
            <p className="ft-col-title">Clientes</p>
            <ul className="ft-list">
              {["Preguntas Frecuentes", "Catálogos", "Compras Corporativas"].map((item) => (
                <li key={item}><a href="#" className="ft-link">{item}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <p className="ft-col-title">Empresa</p>
            <ul className="ft-list">
              {["Nosotros", "Sostenibilidad", "Conoce ARGON", "Trabaja con Nosotros", "Política de Privacidad", "Términos"].map((item) => (
                <li key={item}><a href="#" className="ft-link">{item}</a></li>
              ))}
            </ul>
          </div>

          <div className="ft-newsletter">
            <p className="ft-newsletter-title">Recibe nuestras novedades</p>
            <div className="ft-newsletter-form">
              <input type="email" placeholder="Tu correo electrónico" className="ft-input" />
              <button className="ft-btn">Suscribirse</button>
            </div>
            <p className="ft-disclaimer">Al suscribirte, aceptas nuestra Política de Privacidad y Términos de Servicio.</p>
          </div>
        </div>

        <div className="ft-copy">
          <p>&copy;ARGON 2026</p>
        </div>
      </footer>
    </>
  );
}

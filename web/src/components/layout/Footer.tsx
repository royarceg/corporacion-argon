export default function Footer() {
  return (
    <footer
      style={{
        width: "100%",
        maxWidth: "1400px",
        margin: "0 auto",
        backgroundColor: "#f5f4f4",
        padding: "60px 32px 40px 32px",
      }}
    >
      {/* Main content row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "25px",
          flexWrap: "wrap",
        }}
      >
        {/* Left columns */}
        <div style={{ display: "flex", gap: "25px", flexWrap: "wrap" }}>
          {/* CONTÁCTANOS */}
          <div style={{ width: "192px" }}>
            <p
              style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#565656",
                marginBottom: "16px",
              }}
            >
              Contáctanos
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {["Escríbenos", "Lun-Vie 8am-5pm"].map((item) => (
                <li
                  key={item}
                  style={{
                    fontFamily: "StyreneA, sans-serif",
                    fontSize: "13px",
                    fontWeight: 400,
                    color: "#000000",
                  }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* CLIENTES */}
          <div style={{ width: "192px" }}>
            <p
              style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#565656",
                marginBottom: "16px",
              }}
            >
              Clientes
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                "Iniciar Devolución",
                "Política de Devolución",
                "Preguntas Frecuentes",
                "Catálogos",
                "Compras Corporativas",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "StyreneA, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#000000",
                      textDecoration: "none",
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* EMPRESA */}
          <div style={{ width: "370px" }}>
            <p
              style={{
                fontFamily: "StyreneA, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#565656",
                marginBottom: "16px",
              }}
            >
              Empresa
            </p>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              {[
                "Nosotros",
                "Sostenibilidad",
                "Conoce ARGON",
                "Trabaja con Nosotros",
                "Política de Privacidad",
                "Términos",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "StyreneA, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#000000",
                      textDecoration: "none",
                    }}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Newsletter */}
        <div style={{ maxWidth: "491px", width: "491px" }}>
          <p
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              color: "#000000",
              marginBottom: "16px",
            }}
          >
            Recibe nuestras novedades
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="email"
              placeholder="Tu correo electrónico"
              style={{
                flex: 1,
                height: "42px",
                padding: "0 12px",
                fontFamily: "StyreneA, sans-serif",
                fontSize: "13px",
                color: "#565656",
                border: "1px solid #cccccc",
                borderRadius: "4px",
                outline: "none",
                backgroundColor: "#ffffff",
              }}
            />
            <button
              style={{
                height: "42px",
                padding: "0 24px",
                fontFamily: "StyreneA, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#ffffff",
                backgroundColor: "#000000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Suscribirse
            </button>
          </div>
          <p
            style={{
              fontFamily: "StyreneA, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "#000000",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            Al suscribirte, aceptas nuestra Política de Privacidad y Términos de Servicio.
          </p>
        </div>
      </div>

      {/* Bottom copyright */}
      <div
        style={{
          marginTop: "80px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "StyreneA, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            color: "#565656",
            margin: 0,
          }}
        >
          &copy;ARGON 2026
        </p>
      </div>
    </footer>
  );
}

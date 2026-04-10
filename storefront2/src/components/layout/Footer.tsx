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
          {/* CONTACT US */}
          <div style={{ width: "192px" }}>
            <p
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#565656",
                marginBottom: "16px",
              }}
            >
              Contact Us
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
              {["+1 (844) 326-6000", "Email Us", "Mon-Fri 9am-3pm PT"].map(
                (item) => (
                  <li
                    key={item}
                    style={{
                      fontFamily: "Graphik, sans-serif",
                      fontSize: "13px",
                      fontWeight: 400,
                      color: "#000000",
                    }}
                  >
                    {item}
                  </li>
                )
              )}
            </ul>
          </div>

          {/* CUSTOMERS */}
          <div style={{ width: "192px" }}>
            <p
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#565656",
                marginBottom: "16px",
              }}
            >
              Customers
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
                "Start a Return",
                "Return Policy",
                "FAQ",
                "Catalogs and Mailers",
                "About Group Gifting",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "Graphik, sans-serif",
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

          {/* COMPANY */}
          <div style={{ width: "370px" }}>
            <p
              style={{
                fontFamily: "Graphik, sans-serif",
                fontSize: "11px",
                fontWeight: 400,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "#565656",
                marginBottom: "16px",
              }}
            >
              Company
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
                "About Us",
                "Sustainability",
                "Discover Revive",
                "Careers",
                "Privacy Policy",
                "Terms",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    style={{
                      fontFamily: "Graphik, sans-serif",
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
              fontFamily: "Graphik, sans-serif",
              fontSize: "16px",
              fontWeight: 400,
              color: "#000000",
              marginBottom: "16px",
            }}
          >
            Get the latest new from us
          </p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <input
              type="email"
              placeholder="Enter your email address"
              style={{
                flex: 1,
                height: "42px",
                padding: "0 12px",
                fontFamily: "Graphik, sans-serif",
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
                fontFamily: "Graphik, sans-serif",
                fontSize: "15px",
                fontWeight: 400,
                color: "#ffffff",
                backgroundColor: "#000000",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Subscribe
            </button>
          </div>
          <p
            style={{
              fontFamily: "Graphik, sans-serif",
              fontSize: "13px",
              fontWeight: 400,
              color: "#000000",
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            By signing up, you agree to our Privacy Policy and Terms of Service.
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
            fontFamily: "Graphik, sans-serif",
            fontSize: "13px",
            fontWeight: 400,
            color: "#565656",
            margin: 0,
          }}
        >
          &copy;CEIN
        </p>
      </div>
    </footer>
  );
}

import Image from "next/image";

const products = [
  { name: "Classic Easy Zipper Tote", price: "$298", img: "/images/web/product-row-03.svg" },
  { name: "Concertina Phone Bag", price: "$248", img: "/images/web/product-row-05.svg" },
  { name: "Wool Cashmere Sweater Coat", price: "$398", img: "/images/web/product-row-01.svg" },
  { name: "Single-Origin Cashmere Beanie", price: "$98", img: "/images/web/product-row-04.svg" },
  { name: "Alpaca Wool Cropped Cardigan", price: "$248", img: "/images/web/product-row-02.svg" },
];

export default function ProductRow() {
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
      {/* Title frame */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          padding: "16px 0",
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
          What to Wear Now
        </h2>
      </div>

      {/* 5 Product cards */}
      <div
        style={{
          width: "1336px",
          maxWidth: "100%",
          display: "flex",
          gap: "20px",
          justifyContent: "center",
        }}
      >
        {products.map((product) => (
          <div
            key={product.name}
            style={{
              width: "251px",
              flexShrink: 0,
              display: "flex",
              flexDirection: "column",
              gap: "13px",
            }}
          >
            {/* Product image */}
            <div
              style={{
                width: "251px",
                height: "279px",
                borderRadius: "4px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Image
                src={product.img}
                alt={product.name}
                fill
                className="object-cover"
                sizes="251px"
              />
            </div>
            {/* Detail frame */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "3px",
              }}
            >
              <p
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#000000",
                  margin: 0,
                }}
              >
                {product.name}
              </p>
              <p
                style={{
                  fontFamily: "Graphik, sans-serif",
                  fontSize: "13px",
                  fontWeight: 400,
                  color: "#000000",
                  margin: 0,
                }}
              >
                {product.price}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

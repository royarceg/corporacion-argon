import Image from "next/image";

const blocks = [
  {
    id: "a",
    layout: "image-left",
    image: "/products/ZAP-02.png",
    imageBg: "#e0dacf",
    tag: "CALZADO DE SEGURIDAD",
    name: "Botín Negro Punta de Acero",
    price: "Consultar precio",
    description:
      "Suela MD + hule, punta de acero, antipinchazos y dieléctricos. Diseñado para jornadas largas sin perder comodidad ni protección.",
    cta: "Comprar ahora",
    href: "/botas",
  },
  {
    id: "b",
    layout: "image-right",
    image: "/products/COL-01.png",
    imageBg: "#d4cec3",
    tag: "ROPA LABORAL",
    name: "Camisa Uniforme K-9",
    price: "Consultar precio",
    description:
      "Tela resistente de alta duración con bordado personalizado. Corte profesional que identifica a tu equipo en cualquier entorno.",
    cta: "Comprar ahora",
    href: "/uniformes",
  },
];

function EditorialBlock({
  block,
}: {
  block: (typeof blocks)[0];
}) {
  const imageSection = (
    <div
      className="relative flex-1 flex items-center justify-center overflow-hidden"
      style={{
        minHeight: "700px",
        background: block.imageBg,
        borderRadius: "16px",
      }}
    >
      <Image
        src={block.image}
        alt={block.name}
        width={600}
        height={600}
        className="object-contain"
        style={{ maxHeight: "80%", width: "auto" }}
      />
    </div>
  );

  const textSection = (
    <div
      className="flex-1 flex flex-col justify-center"
      style={{ padding: "60px 80px" }}
    >
      <span
        style={{
          fontFamily: "AkkuratMono, monospace",
          fontSize: "12px",
          fontWeight: 400,
          textTransform: "uppercase",
          letterSpacing: "1.2px",
          color: "var(--color-light-charcoal)",
          lineHeight: "16px",
          marginBottom: "16px",
        }}
      >
        {block.tag}
      </span>
      <h3
        style={{
          fontFamily: "Nantes, serif",
          fontSize: "32px",
          fontWeight: 400,
          color: "var(--color-charcoal)",
          lineHeight: "40px",
          margin: "0 0 8px 0",
        }}
      >
        {block.name}
      </h3>
      <p
        style={{
          fontFamily: "StyreneA, sans-serif",
          fontSize: "14px",
          fontWeight: 500,
          color: "var(--color-charcoal)",
          letterSpacing: "0.3px",
          marginBottom: "16px",
        }}
      >
        {block.price}
      </p>
      <p
        style={{
          fontFamily: "StyreneA, sans-serif",
          fontSize: "14px",
          fontWeight: 400,
          color: "var(--color-light-charcoal)",
          lineHeight: "21px",
          letterSpacing: "0.35px",
          marginBottom: "32px",
          maxWidth: "400px",
        }}
      >
        {block.description}
      </p>
      <a
        href={block.href}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "StyreneA, sans-serif",
          fontSize: "12px",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.3px",
          color: "var(--color-white)",
          background: "var(--color-charcoal)",
          borderRadius: "9999px",
          padding: "10px 24px",
          height: "40px",
          textDecoration: "none",
          width: "fit-content",
        }}
      >
        {block.cta}
      </a>
    </div>
  );

  return (
    <div className="flex" style={{ minHeight: "700px" }}>
      {block.layout === "image-left" ? (
        <>
          {imageSection}
          {textSection}
        </>
      ) : (
        <>
          {textSection}
          {imageSection}
        </>
      )}
    </div>
  );
}

export default function EditorialSplit() {
  return (
    <section className="mx-2.5" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <h2
        style={{
          fontFamily: "Nantes, serif",
          fontSize: "48px",
          fontWeight: 400,
          color: "var(--color-charcoal)",
          lineHeight: "56px",
          textAlign: "center",
          margin: "0 0 40px 0",
        }}
      >
        Equipamiento que marca la diferencia
      </h2>

      <div className="flex flex-col gap-2.5">
        {blocks.map((block) => (
          <EditorialBlock key={block.id} block={block} />
        ))}
      </div>
    </section>
  );
}

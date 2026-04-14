const COLOR_MAP: Record<string, string> = {
  NEGRO: "#1a1a1a",
  BEIGE: "#d4b896",
  "BEIGE-KHAKI": "#c8b88a",
  BLANCO: "#f5f5f5",
  GRIS: "#9e9e9e",
  AZUL: "#2d6a9f",
  "AZUL OSCURO": "#1a3a5c",
  ROJO: "#9c2121",
  VERDE: "#3a6b3a",
  "VERDE OSCURO": "#2a4a2a",
  NARANJA: "#d4612a",
  AMARILLO: "#d4c12a",
  "AMARILLO FOSFORESCENTE": "#e8e020",
  CAFE: "#7a5c3a",
  MARRON: "#7a5c3a",
};

export function colorToHex(color: string): string {
  return COLOR_MAP[color.toUpperCase()] ?? "#cccccc";
}

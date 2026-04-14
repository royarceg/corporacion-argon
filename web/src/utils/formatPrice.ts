export function formatPrice(value: number | string): string {
  return parseFloat(String(value)).toLocaleString("es-CR", {
    style: "currency",
    currency: "CRC",
    minimumFractionDigits: 0,
  });
}

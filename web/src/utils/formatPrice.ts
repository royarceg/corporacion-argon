export function formatPrice(value: number | string): string {
  return parseFloat(String(value)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
}

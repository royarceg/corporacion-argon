const SIZE_ORDER = ["S", "M", "L", "XL", "XXL", "XXXL", "XXXXL"];

export function sortSizes(sizes: string[]): string[] {
  const allNumeric = sizes.every((s) => !isNaN(Number(s)));
  if (allNumeric) return [...sizes].sort((a, b) => Number(a) - Number(b));
  return [...sizes].sort((a, b) => {
    const ia = SIZE_ORDER.indexOf(a.toUpperCase());
    const ib = SIZE_ORDER.indexOf(b.toUpperCase());
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}

function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }
  return matrix[b.length][a.length];
}

function similarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  if (longer.length === 0) return 100;
  const distance = levenshteinDistance(longer, shorter);
  return ((longer.length - distance) / longer.length) * 100;
}

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim();
}

export function fuzzyFilter<T extends { name: string; sku?: string; category?: string; description?: string }>(
  items: T[],
  query: string,
  threshold = 55,
): T[] {
  if (!query.trim()) return items;

  const normalizedQuery = normalize(query);
  const queryWords = normalizedQuery.split(/\s+/);

  const scored = items.map((item) => {
    const searchable = normalize(`${item.name} ${item.sku || ""} ${item.category || ""} ${item.description || ""}`);
    const words = searchable.split(/\s+/);

    let maxScore = 0;
    for (const qw of queryWords) {
      for (const w of words) {
        let score = similarity(qw, w);
        if (w.startsWith(qw)) score += 20;
        else if (qw === w) score = 100;
        else if (w.includes(qw) || qw.includes(w)) score += 10;
        maxScore = Math.max(maxScore, score);
      }
    }
    if (searchable.includes(normalizedQuery)) maxScore += 30;

    return { item, score: maxScore };
  });

  return scored
    .filter((s) => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.item);
}

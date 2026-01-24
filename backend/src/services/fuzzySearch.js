/**
 * UTILIDAD DE BÚSQUEDA DIFUSA (FUZZY SEARCH)
 * Encuentra coincidencias incluso con errores tipográficos
 * 
 * Ejemplos de búsqueda:
 * - "jacket" encontrará: yaket, yacket, jaaaaacket, yaquet, jackete, etc.
 * - "camisa" encontrará: camiza, kamisa, camiseta, etc.
 */

/**
 * Calcula la distancia de Levenshtein entre dos strings
 * Mide cuántas operaciones se necesitan para transformar una palabra en otra
 */
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calcula el porcentaje de similitud entre dos strings
 */
function similarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return ((longer.length - distance) / longer.length) * 100;
}

/**
 * Normaliza un string para búsqueda
 */
function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Busca productos usando búsqueda difusa
 * threshold = 60 significa 60% de similitud mínima
 */
function fuzzySearch(products, query, threshold = 60) {
  if (!query || query.trim() === '') {
    return products;
  }

  const normalizedQuery = normalizeString(query);
  const queryWords = normalizedQuery.split(/\s+/);

  const results = products.map(product => {
    const name = normalizeString(product.name || '');
    const description = normalizeString(product.description || '');
    const sku = normalizeString(product.sku || '');
    const category = normalizeString(product.category || '');
    
    const searchableText = `${name} ${description} ${sku} ${category}`;
    const searchableWords = searchableText.split(/\s+/);

    let maxScore = 0;

    queryWords.forEach(queryWord => {
      searchableWords.forEach(productWord => {
        const score = similarity(queryWord, productWord);
        
        if (productWord.startsWith(queryWord)) {
          maxScore = Math.max(maxScore, score + 20);
        }
        else if (queryWord === productWord) {
          maxScore = Math.max(maxScore, 100);
        }
        else if (productWord.includes(queryWord) || queryWord.includes(productWord)) {
          maxScore = Math.max(maxScore, score + 10);
        }
        else {
          maxScore = Math.max(maxScore, score);
        }
      });
    });

    if (name.includes(normalizedQuery)) {
      maxScore += 30;
    }

    return {
      ...product,
      searchScore: maxScore
    };
  });

  return results
    .filter(item => item.searchScore >= threshold)
    .sort((a, b) => b.searchScore - a.searchScore);
}

module.exports = {
  fuzzySearch,
  similarity,
  normalizeString,
  levenshteinDistance
};

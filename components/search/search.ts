import { ProductType } from '@/types';

export type SearchResult = ProductType & {
  score: number;
};

const MAX_HISTORY = 8;

const STORAGE_KEY = 'aj_store_recent_searches';

/**
 * Normalize text for searching.
 */
export function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Score a single product.
 */
function scoreProduct(product: ProductType, query: string) {
  const q = normalize(query);

  if (!q) return 0;

  let score = 0;

  const variant = product.variants[0];

  const fields = [
    product.name,
    product.shortDescription ?? '',
    product.category,
    ...(product.tags ?? []),
    ...(product.subcategory ? [product.subcategory] : []),
    variant?.label ?? ''
  ];

  fields.forEach(field => {
    const value = normalize(field);

    if (!value) return;

    if (value === q) score += 100;

    if (value.startsWith(q)) score += 50;

    if (value.includes(q)) score += 20;
  });

  if (product.featured) score += 5;

  return score;
}

/**
 * Search products.
 */
export function searchProducts(
  products: ProductType[],
  query: string,
  category?: string
): SearchResult[] {
  const q = normalize(query);

  let list = [...products];

  if (category && category !== 'all') {
    list = list.filter(product => product.category === category);
  }

  if (!q) {
    return list.map(product => ({
      ...product,
      score: 0
    }));
  }

  return list
    .map(product => ({
      ...product,
      score: scoreProduct(product, q)
    }))
    .filter(product => product.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Highlight matching text.
 */
export function highlightMatch(text: string, query: string) {
  if (!query) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  return text.replace(
    new RegExp(`(${escaped})`, 'ig'),
    '<mark>$1</mark>'
  );
}

/**
 * Trending Products
 */
export function getTrendingProducts(products: ProductType[], limit = 6) {
  return [...products]
    .filter(product => product.featured)
    .slice(0, limit);
}

/**
 * Recent Searches
 */
export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    return JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? '[]'
    );
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string) {
  if (!query.trim()) return;

  const history = getRecentSearches();

  const updated = [
    query,
    ...history.filter(item => item !== query)
  ].slice(0, MAX_HISTORY);

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(updated)
  );
}

export function removeRecentSearch(query: string) {
  const history = getRecentSearches();

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(history.filter(item => item !== query))
  );
}

export function clearRecentSearches() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Simple debounce helper.
 */
export function debounce<T extends (...args: never[]) => void>(
  callback: T,
  delay = 300
) {
  let timer: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
}
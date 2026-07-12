import { ProductType } from '@/types/types';

export type SearchResult = ProductType & {
  score: number;
};

const STORAGE_KEY = 'aj-store-search-history';
const MAX_HISTORY = 8;

/**
 * Aliases
 */
const aliases: Record<string, string[]> = {
  whiskey: ['whisky'],
  whisky: ['whiskey'],
  moet: ['moët'],
  moett: ['moët'],
  henesy: ['hennessy'],
  henes: ['hennessy'],
  remy: ['rémy'],
};

/**
 * Normalize
 */
export function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Expand aliases
 */
function expandKeyword(keyword: string) {
  const normalized = normalize(keyword);
  return [normalized, ...(aliases[normalized] ?? [])];
}

/**
 * Weighted score
 */
function scoreField(field: string, keywords: string[], weight: number) {
  const value = normalize(field);
  let score = 0;

  keywords.forEach(keyword => {
    const variants = expandKeyword(keyword);
    variants.forEach(term => {
      if (!term) return;
      if (value === term) score += weight * 10;
      else if (value.startsWith(term)) score += weight * 7;
      else if (value.includes(term)) score += weight * 4;
    });
  });

  return score;
}

/**
 * Search Products
 */
export function searchProducts(
  products: ProductType[],
  query: string,
  category = 'all'
): SearchResult[] {
  const keywords = normalize(query)
    .split(/\s+/)
    .filter(Boolean);

  let list = [...products];

  if (category !== 'all') {
    list = list.filter(product => product.category === category);
  }

  if (!keywords.length) {
    return list.map(product => ({
      ...product,
      score: 0,
    }));
  }

  return list
    .map(product => {
      const variant = product.variants[0];
      let score = 0;

      score += scoreField(product.name, keywords, 10);
      score += scoreField(product.shortDescription, keywords, 7);
      score += scoreField(product.longDescription, keywords, 5);
      score += scoreField(product.category, keywords, 4);

      if (product.subcategory) {
        score += scoreField(product.subcategory, keywords, 4);
      }

      if (variant) {
        score += scoreField(variant.label, keywords, 6);
      }

      product.tags?.forEach(tag => {
        score += scoreField(tag, keywords, 8);
      });

      if (product.featured) {
        score += 3;
      }

      return {
        ...product,
        score,
      };
    })
    .filter(product => product.score > 0)
    .sort((a, b) => b.score - a.score);
}

/**
 * Highlight
 */
export function highlight(text: string, query: string) {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(
    new RegExp(`(${escaped})`, 'ig'),
    '<mark>$1</mark>'
  );
}

/**
 * Trending
 */
export function getTrendingProducts(products: ProductType[], limit = 6) {
  return [...products]
    .filter(item => item.featured)
    .slice(0, limit);
}

/**
 * History
 */
export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
}

export function saveRecentSearch(query: string) {
  if (!query.trim()) return;
  const history = getRecentSearches();
  const updated = [
    query,
    ...history.filter(item => item !== query),
  ].slice(0, MAX_HISTORY);

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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

export function getPopularCategories(products: ProductType[]) {
  const counts = new Map<string, number>();
  products.forEach(product => {
    counts.set(
      product.category,
      (counts.get(product.category) ?? 0) + 1
    );
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);
}

export function getRelatedProducts(
  product: ProductType,
  products: ProductType[],
  limit = 6
) {
  return products
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, limit);
}

export function highlightMatch(text: string, query: string) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.split(regex);
}
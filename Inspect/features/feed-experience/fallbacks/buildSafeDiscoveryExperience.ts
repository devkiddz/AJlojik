import type { FeedContext, FeedExperience, FeedIntent } from "../contracts";

export function buildSafeDiscoveryExperience(intent: FeedIntent, context: FeedContext, reason: string): FeedExperience {
  return {
    id: `safe-store-discovery-${intent.id}`,
    key: "safe-store-discovery",
    intent,
    context,
    modules: [
      { id: "safe-category-rail", type: "category-rail", priority: 100, data: { categories: context.catalog.categories, selectedCategory: intent.categorySlug ?? "all" } },
      { id: "safe-product-grid", type: "product-grid", priority: 60, data: { products: context.catalog.products } },
    ],
    status: "fallback",
    resolution: { registryKey: "safe-store-discovery", reason, usedFallback: true, fallbackKey: "safe-store-discovery" },
    version: 1,
    createdAt: new Date().toISOString(),
  };
}

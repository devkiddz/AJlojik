import { publishCustomerExperienceIntent } from './customerExperienceEvents';

type CustomerProductExperienceTarget = {
  id: string;
  name?: string | null;
  shortDescription?: string | null;
};

function currentCustomerRoute(): string {
  if (typeof window === 'undefined') {
    return '/store';
  }

  return `${window.location.pathname}${window.location.search}` || '/store';
}

/**
 * Opens a product inside the global Discovery Hub without moving the
 * customer away from the page they are currently using.
 */
export function openCustomerProductExperience(product: CustomerProductExperienceTarget): void {
  const productId = String(product.id).trim();

  if (!productId) {
    return;
  }

  publishCustomerExperienceIntent({
    id: `product:${productId}:${Date.now()}`,
    type: 'product',
    source: 'user-action',
    targetId: productId,
    route: currentCustomerRoute(),
    surface: 'product',
    title: product.name?.trim() || 'Product experience',
    ...(product.shortDescription?.trim()
      ? { subtitle: product.shortDescription.trim() }
      : {}),
    createdAt: new Date().toISOString()
  });
}

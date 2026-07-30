import {
  publishCustomerExperienceIntent
} from './customerExperienceEvents';

type CustomerProductExperienceTarget = {
  id: string;

  name?:
    | string
    | null;

  shortDescription?:
    | string
    | null;

  contextLabel?:
    | string
    | null;

  route?: string;
  surface?: string;
};

function currentCustomerRoute(): string {
  if (
    typeof window ===
    'undefined'
  ) {
    return '/store';
  }

  return (
    `${window.location.pathname}${window.location.search}` ||
    '/store'
  );
}

/**
 * Opens a product inside the global Discovery Hub without moving the
 * customer away from the page they are currently using.
 *
 * The optional context label lets public lists, Journeys and future
 * support surfaces explain where the Product Experience originated.
 */
export function openCustomerProductExperience(
  product:
    CustomerProductExperienceTarget
): void {
  const productId =
    String(
      product.id
    ).trim();

  if (!productId) {
    return;
  }

  const description =
    product.shortDescription
      ?.trim() ||
    null;

  const contextLabel =
    product.contextLabel
      ?.trim() ||
    null;

  const subtitle =
    contextLabel &&
    description
      ? `${contextLabel} · ${description}`
      : contextLabel ??
        description;

  publishCustomerExperienceIntent({
    id:
      `product:${productId}:${Date.now()}`,

    type:
      'product',

    source:
      'user-action',

    targetId:
      productId,

    route:
      product.route ??
      currentCustomerRoute(),

    surface:
      product.surface ??
      'product',

    title:
      product.name?.trim() ||
      'Product experience',

    ...(subtitle
      ? {
          subtitle
        }
      : {}),

    createdAt:
      new Date().toISOString()
  });
}

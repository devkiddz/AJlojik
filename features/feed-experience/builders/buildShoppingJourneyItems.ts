import type { ProductType } from '@/types/types';

import type {
  FeedContext,
  ShoppingJourneyItem
} from '../contracts';

type BuildShoppingJourneyItemsInput = {
  context: FeedContext;
  products: ProductType[];
};

function findFirstProduct(
  products: ProductType[],
  productIds: string[]
): ProductType | undefined {
  return productIds
    .map(productId =>
      products.find(product => product.id === productId)
    )
    .find(Boolean);
}

export function buildShoppingJourneyItems({
  context,
  products
}: BuildShoppingJourneyItemsInput): ShoppingJourneyItem[] {
  const items: ShoppingJourneyItem[] = [];

  const cartIds = context.user.cartProductIds;
  const wishlistIds = context.user.wishlistProductIds;
  const recentIds = context.user.recentProductIds;

  const firstCartProduct = findFirstProduct(
    products,
    cartIds
  );

  const firstWishlistProduct = findFirstProduct(
    products,
    wishlistIds
  );

  const firstRecentProduct = findFirstProduct(
    products,
    recentIds
  );

  if (firstCartProduct) {
    items.push({
      id: 'cart',

      title: 'Continue Your Order',

      description:
        cartIds.length === 1
          ? 'One product is waiting in your cart.'
          : `${cartIds.length} products are waiting in your cart.`,

      image:
        firstCartProduct.variants[0]?.image ??
        '/products/placeholder.webp',

      count: cartIds.length,

      badge: `${cartIds.length} ${
        cartIds.length === 1 ? 'item' : 'items'
      }`,

      target: {
        type: 'product',
        productId: firstCartProduct.id
      }
    });
  }

  if (firstWishlistProduct) {
    items.push({
      id: 'wishlist',

      title: 'Saved for Later',

      description:
        wishlistIds.length === 1
          ? 'One saved product is ready to revisit.'
          : `${wishlistIds.length} saved products are ready to revisit.`,

      image:
        firstWishlistProduct.variants[0]?.image ??
        '/products/placeholder.webp',

      count: wishlistIds.length,

      badge: `${wishlistIds.length} saved`,

      target: {
        type: 'product',
        productId: firstWishlistProduct.id
      }
    });
  }

  if (firstRecentProduct) {
    items.push({
      id: 'recently-viewed',

      title: 'Continue Exploring',

      description:
        recentIds.length === 1
          ? 'Return to the product you recently viewed.'
          : `Continue from ${recentIds.length} recently viewed products.`,

      image:
        firstRecentProduct.variants[0]?.image ??
        '/products/placeholder.webp',

      count: recentIds.length,

      badge: 'Recent',

      target: {
        type: 'product',
        productId: firstRecentProduct.id
      }
    });
  }

  return items;
}
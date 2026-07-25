import type {
  CommerceAssistantAction,
  CommerceAssistantContext,
  CommerceDashboardData,
  CommerceHubProjection,
  CommerceJourneyItem,
  CommerceMix,
  CommerceOrder,
  CommercePriorityExperience,
  CommerceProduct,
  CommercePulseItem,
  ResolvedCustomerDashboard
} from '../contracts/customerDashboardTypes';

const activeDeliveryStatuses = new Set([
  'PENDING',
  'ASSIGNED',
  'BARCODE_SCANNED',
  'PICKED_UP',
  'IN_TRANSIT',
  'ARRIVED'
]);

const activeOrderStatuses = new Set([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'READY',
  'DISPATCHED'
]);

function uniqueProducts(
  products: CommerceProduct[]
): CommerceProduct[] {
  return Array.from(
    new Map(
      products.map(product => [
        product.id,
        product
      ])
    ).values()
  );
}

function firstOrderImage(
  order: CommerceOrder | undefined
): string | null {
  return (
    order?.items.find(item => item.image)
      ?.image ?? null
  );
}

function getGreeting(
  generatedAt: string
): string {
  const hour = new Date(
    generatedAt
  ).getHours();

  if (hour < 12) {
    return 'Good morning';
  }

  if (hour < 17) {
    return 'Good afternoon';
  }

  return 'Good evening';
}

function resolvePriorityExperience(
  data: CommerceDashboardData
): CommercePriorityExperience {
  const activeDeliveryOrder =
    data.orders.find(
      order =>
        order.delivery &&
        activeDeliveryStatuses.has(
          order.delivery.status
        )
    );

  if (
    activeDeliveryOrder?.delivery
  ) {
    const delivery =
      activeDeliveryOrder.delivery;

    const progressByStatus: Record<
      string,
      number
    > = {
      PENDING: 12,
      ASSIGNED: 24,
      BARCODE_SCANNED: 38,
      PICKED_UP: 54,
      IN_TRANSIT: 72,
      ARRIVED: 90
    };

    return {
      id: `delivery-${activeDeliveryOrder.id}`,
      kind: 'active-delivery',

      eyebrow: 'Moving with you',
      title:
        delivery.status === 'ARRIVED'
          ? 'Your order has arrived.'
          : 'Your order is on its way.',

      description:
        delivery.estimatedArrival
          ? `Order ${activeDeliveryOrder.orderNumber} is active. Estimated arrival: ${new Date(
              delivery.estimatedArrival
            ).toLocaleString('en-NG', {
              dateStyle: 'medium',
              timeStyle: 'short'
            })}.`
          : `Order ${activeDeliveryOrder.orderNumber} is moving through the delivery journey.`,

      actionLabel: 'Track delivery',
      href: `/orders?order=${activeDeliveryOrder.id}`,

      secondaryActionLabel:
        'View all orders',
      secondaryHref: '/orders',

      image:
        firstOrderImage(
          activeDeliveryOrder
        ),

      tone: 'emerald',

      statusLabel:
        delivery.status.replaceAll(
          '_',
          ' '
        ),

      progress:
        progressByStatus[
          delivery.status
        ] ?? 10
    };
  }

  const paymentAttentionOrder =
    data.orders.find(
      order =>
        order.paymentStatus ===
          'FAILED' ||
        (order.paymentStatus ===
          'PENDING' &&
          order.status === 'PENDING')
    );

  if (paymentAttentionOrder) {
    return {
      id: `payment-${paymentAttentionOrder.id}`,
      kind: 'payment-attention',

      eyebrow: 'Needs your attention',
      title:
        paymentAttentionOrder.paymentStatus ===
        'FAILED'
          ? 'Your payment did not complete.'
          : 'Your order is waiting for payment.',

      description: `Order ${paymentAttentionOrder.orderNumber} is still open. You can safely review it and continue from where the transaction stopped.`,

      actionLabel: 'Review order',
      href: `/orders?order=${paymentAttentionOrder.id}`,

      secondaryActionLabel:
        'Open orders',
      secondaryHref: '/orders',

      image:
        firstOrderImage(
          paymentAttentionOrder
        ),

      tone: 'wine',
      statusLabel:
        paymentAttentionOrder.paymentStatus,

      progress: 20
    };
  }

  const progressingOrder =
    data.orders.find(order =>
      activeOrderStatuses.has(
        order.status
      )
    );

  if (progressingOrder) {
    const progressByStatus: Record<
      string,
      number
    > = {
      PENDING: 15,
      CONFIRMED: 32,
      PROCESSING: 50,
      READY: 68,
      DISPATCHED: 82
    };

    return {
      id: `order-${progressingOrder.id}`,
      kind: 'order-progress',

      eyebrow: 'Your current order',
      title:
        progressingOrder.status ===
        'READY'
          ? 'Your order is ready.'
          : 'Your order is being prepared.',

      description: `Order ${progressingOrder.orderNumber} is currently ${progressingOrder.status
        .replaceAll('_', ' ')
        .toLowerCase()}.`,

      actionLabel: 'Follow progress',
      href: `/orders?order=${progressingOrder.id}`,

      secondaryActionLabel:
        'View all orders',
      secondaryHref: '/orders',

      image:
        firstOrderImage(
          progressingOrder
        ),

      tone: 'navy',
      statusLabel:
        progressingOrder.status.replaceAll(
          '_',
          ' '
        ),

      progress:
        progressByStatus[
          progressingOrder.status
        ] ?? 20
    };
  }

  if (data.pulse.cartQuantity > 0) {
    const cartImage =
      data.cartItems.find(
        item => item.product.image
      )?.product.image ?? null;

    return {
      id: 'cart-continuation',
      kind: 'cart-continuation',

      eyebrow: 'Your journey is waiting',
      title:
        data.pulse.cartQuantity === 1
          ? 'One selection is ready for you.'
          : `${data.pulse.cartQuantity} selections are ready for you.`,

      description:
        'Your cart has been preserved inside this workspace. Continue whenever the moment feels right.',

      actionLabel: 'Continue checkout',
      href: '/cart',

      secondaryActionLabel:
        'Keep discovering',
      secondaryHref: '/store',

      image: cartImage,

      tone: 'gold',
      statusLabel: 'IN CART',
      progress: 58
    };
  }

  if (
    data.pendingReviewProducts.length >
    0
  ) {
    const product =
      data.pendingReviewProducts[0];

    return {
      id: `review-${product.id}`,
      kind: 'pending-review',

      eyebrow: 'Complete the experience',
      title: `How was ${product.name}?`,

      description:
        data.pendingReviewProducts
          .length === 1
          ? 'Your experience can help another customer choose with confidence.'
          : `${data.pendingReviewProducts.length} delivered products are waiting for your experience review.`,

      actionLabel: 'Write a review',
      href: `/products/${product.slug}`,

      secondaryActionLabel:
        'View purchases',
      secondaryHref: '/orders',

      image: product.image,

      tone: 'violet',
      statusLabel: 'REVIEW',
      progress: 92
    };
  }

  const latestHistory =
    data.history[0];

  if (latestHistory) {
    return {
      id: `history-${latestHistory.id}`,
      kind: 'history-continuation',

      eyebrow: 'Jump back in',
      title: latestHistory.label,

      description:
        latestHistory.subtitle ??
        `Return to your ${latestHistory.categorySlug.replaceAll(
          '-',
          ' '
        )} experience.`,

      actionLabel: 'Restore experience',
      href:
        latestHistory.productId
          ? (() => {
              const product = data.catalog.find(
                item =>
                  item.id ===
                  latestHistory.productId
              );

              return product
                ? `/products/${product.slug}`
                : `/store?category=${encodeURIComponent(
                    latestHistory.categorySlug
                  )}`;
            })()
          : `/store?category=${encodeURIComponent(
              latestHistory.categorySlug
            )}`,

      secondaryActionLabel:
        'Start fresh',
      secondaryHref: '/store',

      image: null,

      tone: 'wine',
      statusLabel: 'HISTORY',
      progress: null
    };
  }

  const recentProduct =
    data.recentProducts[0];

  if (recentProduct) {
    return {
      id: `discover-${recentProduct.id}`,
      kind: 'personal-discovery',

      eyebrow: 'Inspired by you',
      title: `Continue exploring ${recentProduct.name}.`,

      description:
        'Your recent activity is shaping a more personal AJ Logik experience around you.',

      actionLabel: 'Return to product',
      href: `/products/${recentProduct.slug}`,

      secondaryActionLabel:
        'Explore your mix',
      secondaryHref: '/store',

      image: recentProduct.image,

      tone: 'navy',
      statusLabel: 'FOR YOU',
      progress: null
    };
  }

  return {
    id: 'welcome',
    kind: 'welcome',

    eyebrow: 'Your commerce world',
    title: 'Let us shape something beautiful around you.',

    description:
      'Explore the store, save what catches your attention, and AJ Logik will begin assembling a personal experience around your activity.',

    actionLabel: 'Enter the store',
    href: '/store',

    secondaryActionLabel:
      'Open preferences',
    secondaryHref: '/settings',

    image: null,

    tone: 'navy',
    statusLabel: 'WELCOME',
    progress: null
  };
}

function resolvePulse(
  data: CommerceDashboardData
): CommercePulseItem[] {
  return [
    {
      id: 'purchases',
      label: 'Purchases',
      value: String(
        data.pulse.paidOrderCount
      ),
      helper: 'Completed commerce',
      href: '/orders'
    },
    {
      id: 'saved',
      label: 'Saved',
      value: String(
        data.pulse.wishlistCount
      ),
      helper: 'Wishlist products',
      href: '/wishlist'
    },
    {
      id: 'cart',
      label: 'In cart',
      value: String(
        data.pulse.cartQuantity
      ),
      helper: 'Ready to continue',
      href: '/cart'
    },
    {
      id: 'reviews',
      label: 'Reviews',
      value: String(
        data.pulse.reviewCount
      ),
      helper:
        data.pulse
          .pendingReviewCount > 0
          ? `${data.pulse.pendingReviewCount} waiting`
          : 'Your shared experiences',
      href: '/orders'
    }
  ];
}

function resolveJourneys(
  data: CommerceDashboardData
): CommerceJourneyItem[] {
  const journeys:
    CommerceJourneyItem[] = [];

  const activeDeliveryOrder =
    data.orders.find(
      order =>
        order.delivery &&
        activeDeliveryStatuses.has(
          order.delivery.status
        )
    );

  if (activeDeliveryOrder) {
    journeys.push({
      id: `journey-delivery-${activeDeliveryOrder.id}`,

      eyebrow: 'Active delivery',
      title: `Track ${activeDeliveryOrder.orderNumber}`,
      description:
        'Follow the order from dispatch to arrival.',

      href: `/orders?order=${activeDeliveryOrder.id}`,
      actionLabel: 'Track order',

      image:
        firstOrderImage(
          activeDeliveryOrder
        ),

      badge:
        activeDeliveryOrder.delivery?.status.replaceAll(
          '_',
          ' '
        ) ?? 'ACTIVE',

      tone: 'emerald'
    });
  }

  if (data.pulse.cartQuantity > 0) {
    journeys.push({
      id: 'journey-cart',

      eyebrow: 'Continue shopping',
      title: 'Your cart is waiting',
      description: `${data.pulse.cartQuantity} item${
        data.pulse.cartQuantity === 1
          ? ''
          : 's'
      } remain connected to this workspace.`,

      href: '/cart',
      actionLabel: 'Open cart',

      image:
        data.cartItems[0]?.product
          .image ?? null,

      badge: `${data.pulse.cartQuantity} ITEMS`,

      tone: 'gold'
    });
  }

  if (
    data.pendingReviewProducts.length >
    0
  ) {
    const product =
      data.pendingReviewProducts[0];

    journeys.push({
      id: `journey-review-${product.id}`,

      eyebrow: 'Your voice matters',
      title: `Review ${product.name}`,
      description:
        'Complete the purchase journey with your experience.',

      href: `/products/${product.slug}`,
      actionLabel: 'Write review',

      image: product.image,

      badge: 'REVIEW',

      tone: 'violet'
    });
  }

  if (data.recentProducts.length > 0) {
    const product =
      data.recentProducts[0];

    journeys.push({
      id: `journey-recent-${product.id}`,

      eyebrow: 'Jump back in',
      title: product.name,
      description:
        'Return to a product you recently explored.',

      href: `/products/${product.slug}`,
      actionLabel: 'Continue',

      image: product.image,

      badge: 'RECENT',

      tone: 'navy'
    });
  }

  if (
    data.wishlistProducts.length > 0
  ) {
    journeys.push({
      id: 'journey-wishlist',

      eyebrow: 'Your saved world',
      title: 'Revisit your wishlist',
      description: `${data.wishlistProducts.length} product${
        data.wishlistProducts.length === 1
          ? ''
          : 's'
      } are saved for later.`,

      href: '/wishlist',
      actionLabel: 'Open wishlist',

      image:
        data.wishlistProducts[0]
          ?.image ?? null,

      badge: `${data.wishlistProducts.length} SAVED`,

      tone: 'wine'
    });
  }

  if (
    data.shoppingListProducts.length >
    0
  ) {
    journeys.push({
      id: 'journey-shopping-list',

      eyebrow: 'Your plan',
      title: 'Continue a shopping list',
      description: `${data.shoppingListProducts.length} products are already shaping this plan.`,

      href: '/settings',
      actionLabel: 'Open lists',

      image:
        data.shoppingListProducts[0]
          ?.image ?? null,

      badge: 'LIST',

      tone: 'gold'
    });
  }

  return journeys.slice(0, 6);
}

function rankProducts(
  data: CommerceDashboardData
): CommerceProduct[] {
  const recentCategories =
    new Set(
      data.recentProducts.map(
        product =>
          product.categorySlug
      )
    );

  const wishlistCategories =
    new Set(
      data.wishlistProducts.map(
        product =>
          product.categorySlug
      )
    );

  const cartProductIds = new Set(
    data.cartItems.map(
      item => item.product.id
    )
  );

  const preferredCategories =
    new Set(
      data.profile
        .preferredCategorySlugs
    );

  const preferredBrands = new Set(
    data.profile
      .preferredBrandSlugs
  );

  return [...data.catalog]
    .filter(
      product =>
        product.available &&
        !cartProductIds.has(product.id)
    )
    .sort((first, second) => {
      const score = (
        product: CommerceProduct
      ) =>
        (preferredCategories.has(
          product.categorySlug
        )
          ? 10
          : 0) +
        (preferredBrands.has(
          product.brandSlug ?? ''
        )
          ? 8
          : 0) +
        (recentCategories.has(
          product.categorySlug
        )
          ? 6
          : 0) +
        (wishlistCategories.has(
          product.categorySlug
        )
          ? 4
          : 0) +
        (product.featured ? 3 : 0) +
        (product.isNew ? 2 : 0) +
        product.rating +
        Math.min(
          product.soldCount / 100,
          3
        );

      return score(second) - score(first);
    });
}

function resolveMixes(
  data: CommerceDashboardData
): CommerceMix[] {
  const mixes: CommerceMix[] = [];

  const rankedProducts =
    rankProducts(data);

  if (rankedProducts.length > 0) {
    mixes.push({
      id: 'made-for-you',

      eyebrow: 'Made for you',
      title: `${data.identity.firstName}'s discovery mix`,
      description:
        'A living mix shaped by your categories, saved products and recent activity.',

      reason:
        data.profile
          .personalizationEnabled
          ? 'Personalized from your commerce signals'
          : 'Premium selections from across AJ Logik',

      products:
        rankedProducts.slice(0, 10),

      href: '/store'
    });
  }

  const recentCategory =
    data.recentProducts[0]
      ?.categorySlug;

  if (recentCategory) {
    const inspiredProducts =
      data.catalog.filter(
        product =>
          product.available &&
          product.categorySlug ===
            recentCategory
      );

    if (inspiredProducts.length > 0) {
      mixes.push({
        id: `inspired-${recentCategory}`,

        eyebrow:
          'Because you explored',
        title: recentCategory
          .replaceAll('-', ' ')
          .replace(/\b\w/g, letter =>
            letter.toUpperCase()
          ),

        description:
          'Continue the mood with more selections from the world you recently entered.',

        reason: `Inspired by your recent ${recentCategory.replaceAll(
          '-',
          ' '
        )} activity`,

        products:
          uniqueProducts(
            inspiredProducts
          ).slice(0, 10),

        href: `/store?category=${encodeURIComponent(
          recentCategory
        )}`
      });
    }
  }

  if (
    data.shoppingListProducts.length >
    0
  ) {
    mixes.push({
      id: 'shopping-list-mix',

      eyebrow: 'Your plans',
      title: 'Shopping list mix',
      description:
        'Products already gathered around your current plan.',

      reason:
        'Preserved from your shopping lists',

      products:
        uniqueProducts(
          data.shoppingListProducts
        ).slice(0, 10),

      href: '/settings'
    });
  }

  if (
    data.wishlistProducts.length > 0
  ) {
    mixes.push({
      id: 'saved-world',

      eyebrow: 'Your collection',
      title: 'Saved for your moment',
      description:
        'A personal shelf of products you chose not to lose.',

      reason:
        'Pulled directly from your wishlist',

      products:
        uniqueProducts(
          data.wishlistProducts
        ).slice(0, 10),

      href: '/wishlist'
    });
  }

  const deliveredProductIds =
    data.orders
      .filter(
        order =>
          order.status === 'DELIVERED'
      )
      .flatMap(order =>
        order.items.map(
          item => item.productId
        )
      );

  const catalogById = new Map(
    data.catalog.map(product => [
      product.id,
      product
    ])
  );

  const buyAgainProducts =
    uniqueProducts(
      deliveredProductIds
        .map(productId =>
          catalogById.get(productId)
        )
        .filter(
          (
            product
          ): product is CommerceProduct =>
            Boolean(product)
        )
    );

  if (buyAgainProducts.length > 0) {
    mixes.push({
      id: 'buy-again',

      eyebrow: 'From your history',
      title: 'Buy it again',
      description:
        'Reliable selections from purchases you already completed.',

      reason:
        'Based on delivered orders',

      products:
        buyAgainProducts.slice(0, 10),

      href: '/orders'
    });
  }

  return mixes.slice(0, 5);
}

function resolveAssistantActions(
  data: CommerceDashboardData,
  priority: CommercePriorityExperience
): CommerceAssistantAction[] {
  const actions:
    CommerceAssistantAction[] = [
      {
        id: 'priority',

        title: priority.title,
        description:
          priority.description,

        actionLabel:
          priority.actionLabel,
        href: priority.href,

        prompt: `Help me with ${priority.title.toLowerCase()}`
      }
    ];

  if (data.pulse.cartQuantity > 0) {
    actions.push({
      id: 'cart-assist',

      title: 'Complete my cart',
      description:
        'Review what is waiting and help me continue confidently.',

      actionLabel: 'Open cart',
      href: '/cart',

      prompt:
        'Help me complete my current cart.'
    });
  }

  if (
    data.shoppingListProducts.length >
    0
  ) {
    actions.push({
      id: 'list-assist',

      title: 'Improve my shopping list',
      description:
        'Use the products already gathered as the foundation for the next suggestions.',

      actionLabel: 'Open lists',
      href: '/settings',

      prompt:
        'Help me improve my current shopping list.'
    });
  }

  if (
    data.pendingReviewProducts.length >
    0
  ) {
    actions.push({
      id: 'review-assist',

      title: 'Complete pending reviews',
      description:
        'Return to delivered products that still need your voice.',

      actionLabel: 'Review products',
      href: '/orders',

      prompt:
        'Show me the products waiting for my review.'
    });
  }

  actions.push({
    id: 'discover-assist',

    title: 'Shape my next experience',
    description:
      'Explore a personalized mix based on the activity already attached to this workspace.',

    actionLabel: 'Explore store',
    href: '/store',

    prompt:
      'Build a new shopping experience around my recent activity.'
  });

  return actions.slice(0, 4);
}

function resolveHubProjection(
  data: CommerceDashboardData,
  priority: CommercePriorityExperience,
  mixes: CommerceMix[]
): CommerceHubProjection {
  const signals =
    [
      {
        id: 'commerce-priority',
        groupId: 'home' as const,

        title: priority.title,
        description:
          priority.description,

        priority: 100,

        badge:
          priority.statusLabel,

        href: priority.href,

        productIds:
          priority.image
            ? []
            : []
      },

      data.pulse.cartQuantity > 0
        ? {
            id: 'commerce-cart',
            groupId:
              'shopping' as const,

            title: 'Cart waiting',
            description: `${data.pulse.cartQuantity} item${
              data.pulse
                .cartQuantity === 1
                ? ''
                : 's'
            } are ready to continue.`,

            priority: 90,

            badge: String(
              data.pulse.cartQuantity
            ),

            href: '/cart',

            productIds:
              data.cartItems.map(
                item =>
                  item.product.id
              )
          }
        : null,

      data.pulse.activeOrderCount > 0
        ? {
            id: 'commerce-orders',
            groupId:
              'orders' as const,

            title: 'Active orders',
            description: `${data.pulse.activeOrderCount} order${
              data.pulse
                .activeOrderCount === 1
                ? ''
                : 's'
            } are still moving.`,

            priority: 95,

            badge: String(
              data.pulse
                .activeOrderCount
            ),

            href: '/orders',

            productIds: data.orders
              .filter(order =>
                activeOrderStatuses.has(
                  order.status
                )
              )
              .flatMap(order =>
                order.items.map(
                  item =>
                    item.productId
                )
              )
          }
        : null,

      data.pulse.wishlistCount > 0
        ? {
            id: 'commerce-wishlist',
            groupId:
              'shopping' as const,

            title: 'Saved products',
            description: `${data.pulse.wishlistCount} saved selection${
              data.pulse
                .wishlistCount === 1
                ? ''
                : 's'
            } remain connected to you.`,

            priority: 70,

            badge: String(
              data.pulse
                .wishlistCount
            ),

            href: '/wishlist',

            productIds:
              data.wishlistProducts.map(
                product =>
                  product.id
              )
          }
        : null,

      data.pulse
        .pendingReviewCount > 0
        ? {
            id: 'commerce-reviews',
            groupId:
              'home' as const,

            title: 'Reviews waiting',
            description: `${data.pulse.pendingReviewCount} delivered product${
              data.pulse
                .pendingReviewCount ===
              1
                ? ''
                : 's'
            } can still receive your experience.`,

            priority: 76,

            badge: String(
              data.pulse
                .pendingReviewCount
            ),

            href: '/orders',

            productIds:
              data.pendingReviewProducts.map(
                product =>
                  product.id
              )
          }
        : null,

      mixes[0]
        ? {
            id: 'commerce-smart-picks',
            groupId: 'ai' as const,

            title: mixes[0].title,
            description:
              mixes[0].reason,

            priority: 80,

            badge: 'FOR YOU',

            href: mixes[0].href,

            productIds:
              mixes[0].products.map(
                product =>
                  product.id
              )
          }
        : null,

      {
        id: 'commerce-settings',
        groupId: 'settings' as const,

        title: 'Experience settings',
        description:
          'Control personalization, notifications and your commerce preferences.',

        priority: 10,

        badge: null,

        href: '/settings',

        productIds: []
      }
    ]
      .filter(
        (
          signal
        ): signal is NonNullable<
          typeof signal
        > => Boolean(signal)
      )
      .sort(
        (first, second) =>
          second.priority -
          first.priority
      );

  return {
    primaryGroupId:
      data.pulse.activeOrderCount > 0
        ? 'orders'
        : 'home',

    signals
  };
}

export function resolveCustomerDashboard(
  data: CommerceDashboardData
): ResolvedCustomerDashboard {
  const greeting = getGreeting(
    data.generatedAt
  );

  const priority =
    resolvePriorityExperience(data);

  const pulse = resolvePulse(data);
  const journeys =
    resolveJourneys(data);
  const mixes = resolveMixes(data);

  const assistantActions =
    resolveAssistantActions(
      data,
      priority
    );

  const assistant:
    CommerceAssistantContext = {
    greeting: `${greeting}, ${data.identity.firstName}.`,

    summary:
      priority.description,

    workspaceId:
      data.workspace.id,
    workspaceMode:
      data.workspace.mode,

    priorityKind:
      priority.kind,

    cartQuantity:
      data.pulse.cartQuantity,

    wishlistCount:
      data.pulse.wishlistCount,

    activeOrderCount:
      data.pulse.activeOrderCount,

    pendingReviewCount:
      data.pulse.pendingReviewCount,

    recentProductIds:
      data.recentProducts.map(
        product => product.id
      ),

    preferredCategorySlugs:
      data.profile
        .preferredCategorySlugs,

    actions: assistantActions
  };

  const hub = resolveHubProjection(
    data,
    priority,
    mixes
  );

  return {
    data,

    greeting,

    priority,
    pulse,

    journeys,
    mixes,

    hub,
    assistant
  };
}

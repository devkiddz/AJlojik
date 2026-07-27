import type {
  CommerceDashboardData,
  CommerceOrder,
  CommerceProduct
} from '../contracts/customerDashboardTypes';

type DashboardSource = {
  data: CommerceDashboardData;
  mixes: Array<{
    id: string;
    title: string;
    href?: string;
    products: CommerceProduct[];
  }>;
};

export type CustomerDashboardView = {
  identity: CommerceDashboardData['identity'];
  membership: string;

  recentProducts: CommerceProduct[];
  wishlistProducts: CommerceProduct[];

  history: CommerceDashboardData['history'];
  orders: CommerceOrder[];
  activeDeliveries: CommerceOrder[];

  cartItems: CommerceDashboardData['cartItems'];
  cartQuantity: number;
  cartSubtotal: number;

  suggestedProducts: CommerceProduct[];
  suggestedHref: string;

  pickedProducts: CommerceProduct[];
  pickedHref: string;
};

const ACTIVE_DELIVERY_STATUSES = new Set([
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY'
]);

export function resolveCustomerDashboardView(
  dashboard: DashboardSource
): CustomerDashboardView {
  const {
    data,
    mixes
  } = dashboard;

  const recentProducts =
    data.recentProducts ?? [];

  const wishlistProducts =
    data.wishlistProducts ?? [];

  const cartItems =
    data.cartItems ?? [];

  const orders =
    data.orders ?? [];

  const history =
    data.history ?? [];

  const catalog =
    data.catalog ?? [];

  const activeDeliveries =
    orders.filter(order => {
      const status =
        order.delivery?.status ??
        order.status;

      return ACTIVE_DELIVERY_STATUSES.has(
        status.toUpperCase()
      );
    });

  const recentIds =
    new Set(
      recentProducts.map(
        product => product.id
      )
    );

  const cartIds =
    new Set(
      cartItems.map(
        item => item.product.id
      )
    );

  const wishlistIds =
    new Set(
      wishlistProducts.map(
        product => product.id
      )
    );

  const suggestedMix =
    mixes.find(mix =>
      /suggest|similar|recommend/i.test(
        `${mix.id} ${mix.title}`
      )
    ) ??
    mixes[0];

  const suggestedProducts =
    uniqueProducts([
      ...(suggestedMix?.products ?? []),
      ...catalog
    ])
      .filter(
        product =>
          !recentIds.has(product.id) &&
          !cartIds.has(product.id) &&
          !wishlistIds.has(product.id)
      )
      .slice(0, 8);

  const suggestedIds =
    new Set(
      suggestedProducts.map(
        product => product.id
      )
    );

  const pickedMix =
    mixes.find(
      mix =>
        mix.id !== suggestedMix?.id &&
        /picked|personal|for you/i.test(
          `${mix.id} ${mix.title}`
        )
    ) ??
    mixes.find(
      mix =>
        mix.id !== suggestedMix?.id
    );

  const pickedProducts =
    uniqueProducts([
      ...wishlistProducts,
      ...(pickedMix?.products ?? []),
      ...catalog
    ])
      .filter(
        product =>
          !recentIds.has(product.id) &&
          !cartIds.has(product.id) &&
          !suggestedIds.has(product.id)
      )
      .slice(0, 8);

  return {
    identity: data.identity,
    membership:
      data.identity.tier ||
      'Member',

    recentProducts,
    wishlistProducts,

    history,
    orders,
    activeDeliveries,

    cartItems,
    cartQuantity:
      data.pulse.cartQuantity,
    cartSubtotal:
      data.pulse.cartSubtotal,

    suggestedProducts,
    suggestedHref:
      suggestedMix?.href ??
      '/store',

    pickedProducts,
    pickedHref:
      pickedMix?.href ??
      '/store'
  };
}

function uniqueProducts(
  products: CommerceProduct[]
): CommerceProduct[] {
  const resolved =
    new Map<
      string,
      CommerceProduct
    >();

  products.forEach(product => {
    if (
      !resolved.has(product.id)
    ) {
      resolved.set(
        product.id,
        product
      );
    }
  });

  return Array.from(
    resolved.values()
  );
}
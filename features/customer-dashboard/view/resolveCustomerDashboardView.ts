import type {
  CommerceDashboardData,
  CommerceOrder,
  CommerceProduct,
  CommerceShoppingList
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
  identity:
    CommerceDashboardData['identity'];

  membership: string;

  recentProducts:
    CommerceProduct[];

  wishlistProducts:
    CommerceProduct[];

  shoppingLists:
    CommerceShoppingList[];

  primaryShoppingList:
    CommerceShoppingList | null;

  shoppingListProducts:
    CommerceProduct[];

  shoppingListsHref: string;

  history:
    CommerceDashboardData['history'];

  orders:
    CommerceOrder[];

  activeDeliveries:
    CommerceOrder[];

  cartItems:
    CommerceDashboardData['cartItems'];

  cartQuantity: number;
  cartSubtotal: number;

  suggestedProducts:
    CommerceProduct[];

  suggestedHref: string;

  pickedProducts:
    CommerceProduct[];

  pickedHref: string;
};

const ACTIVE_DELIVERY_STATUSES =
  new Set([
    'PENDING',
    'ASSIGNED',
    'BARCODE_SCANNED',
    'PICKED_UP',
    'IN_TRANSIT',
    'ARRIVED'
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

function isShoppingListMix(
  mix: DashboardSource['mixes'][number]
): boolean {
  return /shopping-list|shopping list|your plans/i.test(
    `${mix.id} ${mix.title}`
  );
}

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

  const shoppingLists =
    data.shoppingLists ?? [];

  const primaryShoppingList =
    shoppingLists[0] ?? null;

  const shoppingListProducts =
    uniqueProducts(
      primaryShoppingList
        ? primaryShoppingList.items.map(
            item => item.product
          )
        : data.shoppingListProducts ?? []
    );

  const shoppingListsHref =
    primaryShoppingList
      ? `/account/lists/${primaryShoppingList.id}`
      : '/account/lists';

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

  const shoppingListIds =
    new Set(
      shoppingListProducts.map(
        product => product.id
      )
    );

  const recommendationMixes =
    mixes.filter(
      mix =>
        !isShoppingListMix(mix)
    );

  const suggestedMix =
    recommendationMixes.find(
      mix =>
        /suggest|similar|recommend|inspired/i.test(
          `${mix.id} ${mix.title}`
        )
    ) ??
    recommendationMixes[0];

  const suggestedProducts =
    uniqueProducts([
      ...(suggestedMix?.products ??
        []),

      ...catalog
    ])
      .filter(
        product =>
          product.available &&
          !recentIds.has(
            product.id
          ) &&
          !cartIds.has(
            product.id
          ) &&
          !wishlistIds.has(
            product.id
          ) &&
          !shoppingListIds.has(
            product.id
          )
      )
      .slice(
        0,
        12
      );

  const suggestedIds =
    new Set(
      suggestedProducts.map(
        product => product.id
      )
    );

  const pickedMix =
    recommendationMixes.find(
      mix =>
        mix.id !==
          suggestedMix?.id &&
        /picked|personal|for you|made-for-you/i.test(
          `${mix.id} ${mix.title}`
        )
    ) ??
    recommendationMixes.find(
      mix =>
        mix.id !==
        suggestedMix?.id
    );

  const pickedProducts =
    uniqueProducts([
      ...(pickedMix?.products ??
        []),

      ...wishlistProducts,

      ...catalog
    ])
      .filter(
        product =>
          product.available &&
          !recentIds.has(
            product.id
          ) &&
          !cartIds.has(
            product.id
          ) &&
          !shoppingListIds.has(
            product.id
          ) &&
          !suggestedIds.has(
            product.id
          )
      )
      .slice(
        0,
        12
      );

  return {
    identity:
      data.identity,

    membership:
      data.identity.tier ||
      'Member',

    recentProducts,
    wishlistProducts,

    shoppingLists,
    primaryShoppingList,
    shoppingListProducts,
    shoppingListsHref,

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
// data/collections.ts

export type BannerType = {
  id: string;
  image: string;
  alt: string;
  href?: string;
};

export type CollectionType = {
  id: string;
  title: string;
  description: string;

  /** Optional icon for navigation or quick links */
  icon?: string;

  /** Campaign / merchandising banners */
  banners?: BannerType[];

  /** Featured product displayed above or beside the collection */
  featuredProductId?: string;

  /** Products that belong to this collection */
  productIds: string[];
};

export const collections: CollectionType[] = [
  {
    id: "staff-picks",
    title: "Staff Picks",
    description: "Curated by the AJ Logik team.",

    featuredProductId: "prod_37",

    banners: [],

    productIds: [
      "prod_1",
      "prod_2",
      "prod_7",
      "prod_15",
      "prod_35",
      "prod_37",
    ],
  },

  {
    id: "party-essentials",
    title: "Party Essentials",
    description: "Everything you need for birthdays and celebrations.",

    featuredProductId: "prod_10",

    banners: [],

    productIds: [
      "prod_10",
      "prod_26",
      "prod_39",
      "prod_4",
      "prod_9",
      "prod_24",
    ],
  },

  {
    id: "premium-wines",
    title: "Premium Wines",
    description: "Luxury champagne and fine wines.",

    featuredProductId: "prod_7",

    banners: [],

    productIds: [
      "prod_1",
      "prod_5",
      "prod_7",
      "prod_12",
      "prod_29",
      "prod_41",
    ],
  },

  {
    id: "luxury-spirits",
    title: "Luxury Spirits",
    description: "Top shelf selections for exclusive moments.",

    featuredProductId: "prod_16",

    banners: [],

    productIds: [
      "prod_6",
      "prod_16",
      "prod_17",
      "prod_21",
      "prod_30",
    ],
  },

  {
    id: "freshly-baked",
    title: "Freshly Baked",
    description: "Fresh cakes and desserts for every occasion.",

    featuredProductId: "prod_42",

    banners: [],

    productIds: [
      "prod_4",
      "prod_9",
      "prod_23",
      "prod_24",
      "prod_38",
      "prod_42",
    ],
  },

  {
    id: "kitchen-upgrade",
    title: "Kitchen Upgrade",
    description: "Premium appliances for modern kitchens.",

    featuredProductId: "prod_37",

    banners: [],

    productIds: [
      "prod_11",
      "prod_27",
      "prod_28",
      "prod_37",
      "prod_40",
    ],
  },

  {
    id: "new-arrivals",
    title: "New Arrivals",
    description: "Recently added to AJ Logik.",

    featuredProductId: "prod_39",

    banners: [],

    productIds: [
      "prod_8",
      "prod_11",
      "prod_23",
      "prod_27",
      "prod_37",
      "prod_39",
      "prod_41",
    ],
  },

  {
    id: "celebration-favorites",
    title: "Celebration Favorites",
    description: "Customer favourites for memorable occasions.",

    featuredProductId: "prod_1",

    banners: [],

    productIds: [
      "prod_1",
      "prod_2",
      "prod_7",
      "prod_10",
      "prod_24",
      "prod_35",
    ],
  },
];
export type BannerType = {
  id: string;
  image: string;
  alt: string;
  href?: string;
};

export type CollectionLayout =
  | "hero"
  | "carousel"
  | "grid"
  | "featured"
  | "campaign";

export type CollectionType = {
  id: string;

  slug: string;

  title: string;

  subtitle?: string;

  description: string;

  icon?: string;

  color?: string;

  layout: CollectionLayout;

  featuredProductId?: string;

  banners?: BannerType[];

  productIds: string[];

  active: boolean;

  priority: number;
};

export const collections: CollectionType[] = [
  {
    id: "staff-picks",
    slug: "staff-picks",
    title: "Staff Picks",
    subtitle: "Chosen by our team",
    description: "Curated by the AJ Lojics team.",
    layout: "featured",
    featuredProductId: "prod_37",
    productIds: [
      "prod_1",
      "prod_2",
      "prod_7",
      "prod_15",
      "prod_35",
      "prod_37",
    ],
    banners: [],
    active: true,
    priority: 1,
  },

  // other collections...
];
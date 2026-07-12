export type FeedIntentType =
  | "store-discovery"
  | "home"
  | "category"
  | "search"
  | "product"
  | "collection"
  | "promotion";

export type FeedIntentSource =
  | "route"
  | "navigation"
  | "search"
  | "system"
  | "user-action"
  | "feed-card"
  | "hub-card";

export type FeedIntent = {
  id: string;
  type: FeedIntentType;
  source: FeedIntentSource;
  categorySlug?: string;
  targetId?: string;
  query?: string;
  createdAt: string;
};

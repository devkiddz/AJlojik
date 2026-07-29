export type FeedIntentType =
  | 'store-discovery'
  | 'home'
  | 'category'
  | 'search'
  | 'product'
  | 'collection'
  | 'promotion';

export type FeedIntentSource =
  | 'route'
  | 'navigation'
  | 'search'
  | 'system'
  | 'user-action'
  | 'feed-card'
  | 'hub-card';

export type FeedIntent = {
  id: string;
  type: FeedIntentType;
  source: FeedIntentSource;
  categorySlug?: string;
  targetId?: string;
  query?: string;

  /**
   * Canonical customer-facing destination for this experience.
   *
   * The Feed may still resolve an experience without changing pages,
   * but the global Experience Stack needs a stable route when the
   * customer later restores that state from another surface.
   */
  route?: string;

  /** Route-sensitive surface used by the global Discovery Hub. */
  surface?: string;

  /** Optional human-readable route copy for history presentation. */
  title?: string;
  subtitle?: string;

  createdAt: string;
};

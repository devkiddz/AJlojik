export type ExperienceHistoryRetention =
  | 'SESSION'
  | 'ONE_DAY'
  | 'SEVEN_DAYS'
  | 'THIRTY_DAYS'
  | 'FOREVER';

export type ExperienceHistorySource =
  | 'CATEGORY'
  | 'DISCOVERY_HUB'
  | 'SMART_PICK'
  | 'CAMPAIGN'
  | 'SEARCH'
  | 'COLLECTION'
  | 'PRODUCT'
  | 'SYSTEM';

export type ExperienceHistorySettings = {
  enabled: boolean;
  retention: ExperienceHistoryRetention;
  maxEntries: number;
};

export type ExperienceHistoryEntry = {
  id: string;
  label: string;
  subtitle: string | null;

  categorySlug: string;
  source: ExperienceHistorySource;

  experienceId: string | null;
  campaignId: string | null;
  collectionId: string | null;
  productId: string | null;

  intentSnapshot: Record<string, unknown>;
  contextSnapshot: Record<string, unknown> | null;

  fingerprint: string;

  visitedAt: string;
  expiresAt: string | null;
};

export type ExperienceStackState = {
  entries: ExperienceHistoryEntry[];
  settings: ExperienceHistorySettings;

  canGoBack: boolean;
  currentEntry: ExperienceHistoryEntry | null;
};
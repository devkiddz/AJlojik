import type { ExperienceTarget } from '@/features/feed-experience';

import type {
  FeedContext,
  FeedIntent
} from '@/features/feed-experience/contracts';

// ============================================================
// SHARED DISCOVERY IDENTIFIERS
// ============================================================

/**
 * Discovery identifiers are intentionally extensible.
 *
 * New RCENTZ products and business modules can register
 * capabilities without editing a central string union.
 */
export type DiscoveryGroupId = string;

export type DiscoveryWidgetId = string;

export type DiscoveryComponentKey = string;

export type DiscoveryIconKey = string;

export type DiscoveryPageMode = string;

export type DiscoveryIntentType = string;

export type DiscoverySignalKey = string;

// ============================================================
// CURRENT HUB IDENTIFIERS
// ============================================================

/**
 * Compatibility aliases.
 *
 * Existing Hub components can continue using HubGroupId
 * and HubWidgetId while the architecture migrates toward
 * the broader Discovery contracts.
 */
export type HubGroupId = DiscoveryGroupId;

export type HubWidgetId = DiscoveryWidgetId;

// ============================================================
// EXISTING HUB PRESENTATION TYPES
// ============================================================

export type HubWidgetLayout =
  | 'hero'
  | 'slider'
  | 'grid'
  | 'minimal-grid'
  | 'tracking'
  | 'summary'
  | 'membership';

export type HubWidgetSize =
  | 'sm'
  | 'md'
  | 'lg';

export type HubWidgetStatus =
  | 'idle'
  | 'active'
  | 'warning'
  | 'success';

export type HubPreviewMode =
  | 'inline'
  | 'modal'
  | 'feed';

export type HubAction = {
  label: string;
  href?: string;
  target?: ExperienceTarget;
};

export type HubStat = {
  label: string;
  value: string | number;
  helper?: string;
};

export type HubSlideItem = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  price?: number;
  badge?: string;
  href?: string;
  target?: ExperienceTarget;
};

export type HubVisual = {
  image: string;
  alt?: string;
};

export type HubProgress = {
  label: string;
  value: number;
  helper?: string;
};

export type HubTimelineItem = {
  id: string;
  label: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
  time?: string;
};

export type HubCondition = {
  label: string;
  value: string;
};

export type HubLocation = {
  title: string;
  subtitle?: string;
  mapImage?: string;

  coordinates?: {
    lat: number;
    lng: number;
  };
};

// ============================================================
// CURRENT HUB WIDGET CONTRACT
// ============================================================

/**
 * Existing rendered Hub widget.
 *
 * This remains intact during the migration so the current
 * Hub data and renderers continue to compile.
 */
export type HubWidget = {
  id: HubWidgetId;
  groupId: HubGroupId;

  title: string;
  description?: string;

  order: number;
  enabled: boolean;

  size?: HubWidgetSize;
  status?: HubWidgetStatus;

  badge?: string | number;
  meta?: string;

  image?: string;
  visual?: HubVisual;

  accent?: string;

  stats?: HubStat[];

  slides?: HubSlideItem[];
  autoSlide?: boolean;

  progress?: HubProgress;

  timeline?: HubTimelineItem[];

  conditions?: HubCondition[];

  location?: HubLocation;

  insight?: string;

  action?: HubAction;
  actions?: HubAction[];

  layout?: HubWidgetLayout;
};

// ============================================================
// CURRENT HUB GROUP CONTRACT
// ============================================================

/**
 * These icon keys remain available to the current renderer.
 *
 * The new Discovery registry uses DiscoveryIconKey so future
 * products are not restricted to this list.
 */
export type HubGroupIcon =
  | 'home'
  | 'shopping'
  | 'orders'
  | 'rewards'
  | 'ai'
  | 'settings';

export type HubGroupIndicator =
  | 'dot'
  | 'new'
  | 'live'
  | 'spark';

/**
 * Existing rendered Hub group.
 */
export type HubGroup = {
  id: HubGroupId;
  label: string;
  icon: HubGroupIcon;

  description?: string;

  order: number;

  indicator?: HubGroupIndicator;
};

// ============================================================
// HUB PREVIEW AND PROVIDER CONTRACTS
// ============================================================

export type HubPreview = {
  widgetId: HubWidgetId;

  title: string;
  description?: string;

  mode: HubPreviewMode;

  image?: string;

  action?: HubAction;
};

export type HubContextValue = {
  groups: HubGroup[];
  widgets: HubWidget[];

  activeGroupId: HubGroupId;

  activePreview: HubPreview | null;

  setActiveGroupId: (
    groupId: HubGroupId
  ) => void;

  openPreview: (
    preview: HubPreview
  ) => void;

  closePreview: () => void;
};

// ============================================================
// COMPACT DISCOVERY CONTRACTS
// ============================================================

export type CompactDiscoveryItemIcon =
  | 'cart'
  | 'wishlist'
  | 'recent'
  | 'recommendation'
  | 'membership'
  | 'ai';

export type CompactDiscoveryItemTone =
  | 'default'
  | 'primary'
  | 'emerald'
  | 'violet'
  | 'amber'
  | 'rose';

export type CompactDiscoveryItem = {
  id: string;

  label: string;
  value: string;

  description?: string;

  icon: CompactDiscoveryItemIcon;
  tone: CompactDiscoveryItemTone;

  priority: number;

  /**
   * The expanded Discovery group that owns this item.
   */
  groupId?: HubGroupId;

  /**
   * The specific widget represented by this shortcut.
   */
  widgetId?: HubWidgetId;

  /**
   * Optional attention signal.
   */
  active?: boolean;
};

// ============================================================
// DISCOVERY ELIGIBILITY
// ============================================================

/**
 * Reusable rules controlling where a registered capability
 * is eligible to participate.
 *
 * These are metadata contracts only. The future resolver
 * will execute the actual eligibility checks.
 */
export type DiscoveryEligibilityRules = {
  enabled?: boolean;

  requiresAuthentication?: boolean;

  supportedPageModes?: DiscoveryPageMode[];

  excludedPageModes?: DiscoveryPageMode[];

  supportedIntentTypes?: DiscoveryIntentType[];

  excludedIntentTypes?: DiscoveryIntentType[];

  requiredSignals?: DiscoverySignalKey[];
};

// ============================================================
// DISCOVERY PRIORITY
// ============================================================

/**
 * Allows a group or widget to receive different priority
 * values depending on the active page.
 */
export type DiscoveryPagePriorityMap = Partial<
  Record<
    DiscoveryPageMode,
    number
  >
>;

/**
 * Allows a group or widget to receive different priority
 * values depending on the active intent.
 */
export type DiscoveryIntentPriorityMap = Partial<
  Record<
    DiscoveryIntentType,
    number
  >
>;

// ============================================================
// DISCOVERY GROUP REGISTRY DEFINITION
// ============================================================

/**
 * Describes a Discovery capability available to the system.
 *
 * This is not yet a rendered tab. The resolver determines
 * whether it becomes visible in the current experience.
 */
export type DiscoveryGroupDefinition = {
  id: DiscoveryGroupId;

  label: string;
  description?: string;

  /**
   * Extensible key resolved by the Discovery icon registry.
   */
  iconKey: DiscoveryIconKey;

  defaultPriority: number;

  pagePriority?: DiscoveryPagePriorityMap;

  intentPriority?: DiscoveryIntentPriorityMap;

  pinned?: boolean;

  indicator?: HubGroupIndicator;

  eligibility?: DiscoveryEligibilityRules;

  /**
   * Optional explicit widget membership.
   *
   * Widgets can also associate themselves through groupId.
   */
  widgetIds?: DiscoveryWidgetId[];
};

// ============================================================
// DISCOVERY WIDGET REGISTRY DEFINITION
// ============================================================

/**
 * Describes a widget capability available to Discovery.
 *
 * It retains the existing visual widget fields while adding
 * registry, eligibility and priority metadata.
 */
export type DiscoveryWidgetDefinition = Omit<
  HubWidget,
  | 'id'
  | 'groupId'
  | 'order'
  | 'enabled'
> & {
  id: DiscoveryWidgetId;

  groupId: DiscoveryGroupId;

  /**
   * Key used to find a custom widget implementation.
   *
   * Widgets without a componentKey can continue using the
   * generic Hub renderer.
   */
  componentKey?: DiscoveryComponentKey;

  defaultPriority: number;

  pagePriority?: DiscoveryPagePriorityMap;

  intentPriority?: DiscoveryIntentPriorityMap;

  eligibility?: DiscoveryEligibilityRules;
};

// ============================================================
// DISCOVERY REGISTRY
// ============================================================

/**
 * Complete set of capabilities made available by:
 *
 * RCENTZ core
 * + product blueprint
 * + business/workspace extensions
 */
export type DiscoveryRegistry = {
  groups: DiscoveryGroupDefinition[];

  widgets: DiscoveryWidgetDefinition[];
};

// ============================================================
// DISCOVERY WORKSPACE CONFIGURATION
// ============================================================

/**
 * Runtime configuration can enable, disable or reprioritise
 * registered capabilities without changing their code.
 */
export type DiscoveryWorkspaceConfiguration = {
  enabledGroupIds?: DiscoveryGroupId[];

  disabledGroupIds?: DiscoveryGroupId[];

  enabledWidgetIds?: DiscoveryWidgetId[];

  disabledWidgetIds?: DiscoveryWidgetId[];

  groupPriorityOverrides?: Partial<
    Record<
      DiscoveryGroupId,
      number
    >
  >;

  widgetPriorityOverrides?: Partial<
    Record<
      DiscoveryWidgetId,
      number
    >
  >;
};

// ============================================================
// DISCOVERY RESOLUTION INPUT
// ============================================================

/**
 * Feed and Discovery consume the same intent and context.
 *
 * The route contributes pageMode, while the shared Feed
 * experience contributes the active intent and user reality.
 */
export type DiscoveryResolutionInput = {
  pageMode: DiscoveryPageMode;

  intent: FeedIntent;

  context: FeedContext;

  registry: DiscoveryRegistry;

  workspaceConfiguration?: DiscoveryWorkspaceConfiguration;

  previousActiveGroupId?: DiscoveryGroupId;
};

// ============================================================
// RESOLVED DISCOVERY WIDGET
// ============================================================

/**
 * A widget that survived eligibility and received its final
 * contextual priority.
 */
export type ResolvedDiscoveryWidget =
  DiscoveryWidgetDefinition & {
    priority: number;

    visible: boolean;

    reason: string;
  };

// ============================================================
// RESOLVED DISCOVERY GROUP
// ============================================================

/**
 * A group that contains at least one eligible widget or was
 * explicitly retained as a pinned capability.
 */
export type ResolvedDiscoveryGroup =
  DiscoveryGroupDefinition & {
    priority: number;

    visible: boolean;

    widgetIds: DiscoveryWidgetId[];

    badge?: string | number;

    reason: string;
  };

// ============================================================
// RESOLVED COMPACT DISCOVERY ITEM
// ============================================================

export type ResolvedCompactDiscoveryItem =
  CompactDiscoveryItem & {
    groupId?: DiscoveryGroupId;

    widgetId?: DiscoveryWidgetId;

    reason?: string;
  };

// ============================================================
// FINAL DISCOVERY EXPERIENCE
// ============================================================

/**
 * The single runtime contract consumed by:
 *
 * Desktop Discovery Hub
 * Compact Discovery Rail
 * Mobile Discovery Sheet
 * Future embedded Discovery surfaces
 */
export type ResolvedDiscoveryExperience = {
  groups: ResolvedDiscoveryGroup[];

  widgets: ResolvedDiscoveryWidget[];

  compactItems: ResolvedCompactDiscoveryItem[];

  primaryGroupId?: DiscoveryGroupId;

  primaryWidgetId?: DiscoveryWidgetId;

  activeGroupId?: DiscoveryGroupId;

  pageMode: DiscoveryPageMode;

  intentType: DiscoveryIntentType;
};
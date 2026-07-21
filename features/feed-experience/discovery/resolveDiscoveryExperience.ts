import type {
  DiscoveryEligibilityRules,
  DiscoveryGroupDefinition,
  DiscoveryGroupId,
  DiscoveryRegistry,
  DiscoverySignalKey,
  DiscoveryWidgetDefinition,
  DiscoveryWorkspaceConfiguration,
  HubWidget,
  ResolvedCompactDiscoveryItem,
  ResolvedDiscoveryExperience,
  ResolvedDiscoveryGroup,
  ResolvedDiscoveryWidget
} from '@/components/discovery-hub-panel/discoveryHubTypes';

import {
  selectCompactDiscoveryItems,
  selectDiscoveryHubWidgets
} from '../selectors';

import type {
  FeedContext,
  FeedIntent
} from '../contracts';

type ResolveEligibilityInput = {
  rules?: DiscoveryEligibilityRules;

  pageMode: string;

  intent: FeedIntent;

  authenticated: boolean;

  signals: Set<DiscoverySignalKey>;
};

type ResolvePriorityInput = {
  defaultPriority: number;

  pagePriority?: Partial<
    Record<
      string,
      number
    >
  >;

  intentPriority?: Partial<
    Record<
      string,
      number
    >
  >;

  pageMode: string;

  intentType: string;

  override?: number;
};

function collectDiscoverySignals(
  context: FeedContext
): Set<DiscoverySignalKey> {
  const recentProductIds = [
    ...context.user.recentProductIds,
    ...context.activity.viewedProductIds
  ];

  const hasCart =
    context.user.cartProductIds.length > 0;

  const hasWishlist =
    context.user.wishlistProductIds.length > 0;

  const hasRecent =
    recentProductIds.length > 0;

  const hasOrders =
    Boolean(
      context.experience?.orders.recent.length
    );

  const hasActiveDelivery =
    Boolean(
      context.experience?.orders.activeDelivery
    );

  const hasCoupons =
    Boolean(
      context.experience?.coupons.length
    );

  const hasProducts =
    context.catalog.products.length > 0;

  const hasPromotions =
    context.catalog.promotions.length > 0;

  const hasMembership =
    context.user.authenticated &&
    context.user.tier !== 'guest';

  const hasRewards =
    context.user.authenticated &&
    Boolean(
      context.experience?.rewards
    );

  const hasIntelligence =
    context.user.authenticated &&
    Boolean(
      context.experience?.intelligence
    );

  const hasRecommendations =
    context.user.authenticated &&
    hasProducts;

  const signals =
    new Set<DiscoverySignalKey>();

  signals.add('settings');

  if (context.user.authenticated) {
    signals.add('authenticated');
  }

  if (hasCart) {
    signals.add('cart');
  }

  if (hasWishlist) {
    signals.add('wishlist');
  }

  if (hasRecent) {
    signals.add('recent');
  }

  if (
    hasCart ||
    hasWishlist ||
    hasRecent
  ) {
    signals.add(
      'shopping-activity'
    );
  }

  if (hasOrders) {
    signals.add('orders');
  }

  if (hasActiveDelivery) {
    signals.add(
      'active-delivery'
    );
  }

  if (hasCoupons) {
    signals.add('coupons');
  }

  if (hasProducts) {
    signals.add('products');
  }

  if (hasPromotions) {
    signals.add('promotions');
  }

  if (hasMembership) {
    signals.add('membership');
  }

  if (hasRewards) {
    signals.add('rewards');
  }

  if (hasIntelligence) {
    signals.add('intelligence');
  }

  if (hasRecommendations) {
    signals.add(
      'recommendations'
    );
  }

  return signals;
}

function isEligible({
  rules,
  pageMode,
  intent,
  authenticated,
  signals
}: ResolveEligibilityInput): boolean {
  if (!rules) {
    return true;
  }

  if (rules.enabled === false) {
    return false;
  }

  if (
    rules.requiresAuthentication &&
    !authenticated
  ) {
    return false;
  }

  if (
    rules.supportedPageModes?.length &&
    !rules.supportedPageModes.includes(
      pageMode
    )
  ) {
    return false;
  }

  if (
    rules.excludedPageModes?.includes(
      pageMode
    )
  ) {
    return false;
  }

  if (
    rules.supportedIntentTypes?.length &&
    !rules.supportedIntentTypes.includes(
      intent.type
    )
  ) {
    return false;
  }

  if (
    rules.excludedIntentTypes?.includes(
      intent.type
    )
  ) {
    return false;
  }

  if (
    rules.requiredSignals?.some(
      signal => !signals.has(signal)
    )
  ) {
    return false;
  }

  if (
    rules.anySignals?.length &&
    !rules.anySignals.some(
      signal => signals.has(signal)
    )
  ) {
    return false;
  }

  return true;
}

function isDefinitionEnabled(
  id: string,
  enabledIds:
    | string[]
    | undefined,
  disabledIds:
    | string[]
    | undefined
): boolean {
  if (
    disabledIds?.includes(id)
  ) {
    return false;
  }

  if (
    enabledIds?.length &&
    !enabledIds.includes(id)
  ) {
    return false;
  }

  return true;
}

function resolvePriority({
  defaultPriority,
  pagePriority,
  intentPriority,
  pageMode,
  intentType,
  override
}: ResolvePriorityInput): number {
  if (
    typeof override === 'number'
  ) {
    return override;
  }

  const intentValue =
    intentPriority?.[
      intentType
    ];

  if (
    typeof intentValue ===
    'number'
  ) {
    return intentValue;
  }

  const pageValue =
    pagePriority?.[
      pageMode
    ];

  if (
    typeof pageValue ===
    'number'
  ) {
    return pageValue;
  }

  return defaultPriority;
}

function toHubWidget(
  definition: DiscoveryWidgetDefinition
): HubWidget {
  return {
    id: definition.id,
    groupId:
      definition.groupId,

    title:
      definition.title,
    description:
      definition.description,

    order: 0,
    enabled: true,

    size:
      definition.size,
    status:
      definition.status,

    badge:
      definition.badge,
    meta:
      definition.meta,

    image:
      definition.image,
    visual:
      definition.visual,

    accent:
      definition.accent,

    stats:
      definition.stats,

    slides:
      definition.slides,
    autoSlide:
      definition.autoSlide,

    progress:
      definition.progress,

    timeline:
      definition.timeline,

    conditions:
      definition.conditions,

    location:
      definition.location,

    insight:
      definition.insight,

    action:
      definition.action,
    actions:
      definition.actions,

    layout:
      definition.layout
  };
}

function resolveWidgetReason(
  definition: DiscoveryWidgetDefinition,
  pageMode: string,
  intentType: string
): string {
  if (
    typeof definition.intentPriority?.[
      intentType
    ] === 'number'
  ) {
    return `Promoted by the active "${intentType}" intent.`;
  }

  if (
    typeof definition.pagePriority?.[
      pageMode
    ] === 'number'
  ) {
    return `Prioritized for the "${pageMode}" page.`;
  }

  return 'Resolved from its default Discovery priority.';
}

function resolveGroupReason(
  definition: DiscoveryGroupDefinition,
  pageMode: string,
  intentType: string
): string {
  if (
    typeof definition.intentPriority?.[
      intentType
    ] === 'number'
  ) {
    return `Group promoted by the active "${intentType}" intent.`;
  }

  if (
    typeof definition.pagePriority?.[
      pageMode
    ] === 'number'
  ) {
    return `Group prioritized for the "${pageMode}" page.`;
  }

  if (definition.pinned) {
    return 'Pinned Discovery capability.';
  }

  return 'Group retained because it contains eligible widgets.';
}

function findPrimaryGroupId(
  groups: ResolvedDiscoveryGroup[],
  registry: DiscoveryRegistry,
  pageMode: string,
  intentType: string
): DiscoveryGroupId | undefined {
  const groupById =
    new Map(
      registry.groups.map(
        group => [
          group.id,
          group
        ]
      )
    );

  const intentPrimary =
    groups.find(group => {
      const definition =
        groupById.get(
          group.id
        );

      return (
        typeof definition
          ?.intentPriority?.[
            intentType
          ] === 'number'
      );
    });

  if (intentPrimary) {
    return intentPrimary.id;
  }

  const pagePrimary =
    groups.find(group => {
      const definition =
        groupById.get(
          group.id
        );

      return (
        typeof definition
          ?.pagePriority?.[
            pageMode
          ] === 'number'
      );
    });

  return (
    pagePrimary?.id ??
    groups[0]?.id
  );
}

function resolveCompactItems(
  context: FeedContext,
  groups: ResolvedDiscoveryGroup[],
  widgets: ResolvedDiscoveryWidget[]
): ResolvedCompactDiscoveryItem[] {
  const baseItems =
    selectCompactDiscoveryItems(
      context
    );

  const resolvedGroupIds =
    new Set(
      groups.map(group => group.id)
    );

  return baseItems
    .map(item => {
      const resolvedWidget =
        widgets.find(widget =>
          widget.definition.compact?.icons.includes(
            item.icon
          )
        );

      const groupId =
        resolvedWidget
          ?.groupId ??
        item.groupId;

      const priority =
        (resolvedWidget?.priority ??
          item.priority) +
        (resolvedWidget?.definition.compact?.priorityBoost ??
          0);

      return {
        ...item,

        groupId,

        widgetId:
          resolvedWidget?.id,

        priority,

        reason:
          resolvedWidget
            ? `Compact projection of "${resolvedWidget.title}".`
            : 'Resolved from shared customer activity.'
      };
    })
    .filter(item => {
      if (!item.groupId) {
        return true;
      }

      return resolvedGroupIds.has(
        item.groupId
      );
    })
    .sort(
      (
        firstItem,
        secondItem
      ) =>
        secondItem.priority -
        firstItem.priority
    );
}

export function resolveDiscoveryExperience({
  pageMode,
  intent,
  context,
  registry,
  workspaceConfiguration,
  previousActiveGroupId
}: {
  pageMode: string;

  intent: FeedIntent;

  context: FeedContext;

  registry: DiscoveryRegistry;

  workspaceConfiguration?: DiscoveryWorkspaceConfiguration;

  previousActiveGroupId?: DiscoveryGroupId;
}): ResolvedDiscoveryExperience {
  const signals =
    collectDiscoverySignals(
      context
    );

  const eligibleGroupDefinitions =
    registry.groups.filter(
      definition =>
        isDefinitionEnabled(
          definition.id,
          workspaceConfiguration
            ?.enabledGroupIds,
          workspaceConfiguration
            ?.disabledGroupIds
        ) &&
        isEligible({
          rules:
            definition.eligibility,

          pageMode,

          intent,

          authenticated:
            context.user
              .authenticated,

          signals
        })
    );

  const eligibleGroupIds =
    new Set(
      eligibleGroupDefinitions.map(
        definition =>
          definition.id
      )
    );

  const eligibleWidgetDefinitions =
    registry.widgets.filter(
      definition =>
        eligibleGroupIds.has(
          definition.groupId
        ) &&
        isDefinitionEnabled(
          definition.id,
          workspaceConfiguration
            ?.enabledWidgetIds,
          workspaceConfiguration
            ?.disabledWidgetIds
        ) &&
        isEligible({
          rules:
            definition.eligibility,

          pageMode,

          intent,

          authenticated:
            context.user
              .authenticated,

          signals
        })
    );

  /**
   * Preserve the existing personalization selector.
   *
   * Registry metadata decides capability eligibility and
   * contextual priority. The selector continues resolving
   * live badges, stats and user-dependent widget content.
   */
  const personalizedWidgets =
    selectDiscoveryHubWidgets({
      widgets:
        eligibleWidgetDefinitions.map(
          toHubWidget
        ),

      context
    });

  const personalizedWidgetById =
    new Map(
      personalizedWidgets
        .filter(
          widget =>
            widget.enabled
        )
        .map(widget => [
          widget.id,
          widget
        ])
    );

  const resolvedWidgets =
    eligibleWidgetDefinitions
      .map(definition => {
        const personalizedWidget =
          personalizedWidgetById.get(
            definition.id
          );

        if (
          !personalizedWidget
        ) {
          return null;
        }

        const priority =
          resolvePriority({
            defaultPriority:
              definition.defaultPriority,

            pagePriority:
              definition.pagePriority,

            intentPriority:
              definition.intentPriority,

            pageMode,

            intentType:
              intent.type,

            override:
              workspaceConfiguration
                ?.widgetPriorityOverrides?.[
                  definition.id
                ]
          });

        return {
          ...personalizedWidget,

          priority,

          reason:
            resolveWidgetReason(
              definition,
              pageMode,
              intent.type
            ),

          definition
        } satisfies ResolvedDiscoveryWidget;
      })
      .filter(
        (
          widget
        ): widget is ResolvedDiscoveryWidget =>
          Boolean(widget)
      )
      .sort(
        (
          firstWidget,
          secondWidget
        ) =>
          secondWidget.priority -
          firstWidget.priority
      )
      .map(
        (
          widget,
          index
        ) => ({
          ...widget,

          order:
            index + 1
        })
      );

  const widgetsByGroupId =
    new Map<
      DiscoveryGroupId,
      ResolvedDiscoveryWidget[]
    >();

  resolvedWidgets.forEach(
    widget => {
      const current =
        widgetsByGroupId.get(
          widget.groupId
        ) ?? [];

      current.push(widget);

      widgetsByGroupId.set(
        widget.groupId,
        current
      );
    }
  );

  const resolvedGroups =
    eligibleGroupDefinitions
      .map(definition => {
        const groupWidgets =
          widgetsByGroupId.get(
            definition.id
          ) ?? [];

        if (
          !definition.pinned &&
          groupWidgets.length === 0
        ) {
          return null;
        }

        const priority =
          resolvePriority({
            defaultPriority:
              definition.defaultPriority,

            pagePriority:
              definition.pagePriority,

            intentPriority:
              definition.intentPriority,

            pageMode,

            intentType:
              intent.type,

            override:
              workspaceConfiguration
                ?.groupPriorityOverrides?.[
                  definition.id
                ]
          });

        const group: ResolvedDiscoveryGroup =
          {
            id: definition.id,

            label:
              definition.label,

            icon:
              definition.iconKey,

            description:
              definition.description,

            indicator:
              definition.indicator,

            order: 0,

            priority,

            widgetIds:
              groupWidgets.map(
                widget =>
                  widget.id
              ),

            reason:
              resolveGroupReason(
                definition,
                pageMode,
                intent.type
              ),

            definition
          };

        return group;
      })
      .filter(
        (
          group
        ): group is ResolvedDiscoveryGroup =>
          Boolean(group)
      )
      .sort(
        (
          firstGroup,
          secondGroup
        ) =>
          secondGroup.priority -
          firstGroup.priority
      )
      .map(
        (
          group,
          index
        ) => ({
          ...group,

          order:
            index + 1
        })
      );

  const primaryGroupId =
    findPrimaryGroupId(
      resolvedGroups,
      registry,
      pageMode,
      intent.type
    );

  const previousGroupStillExists =
    previousActiveGroupId
      ? resolvedGroups.some(
          group =>
            group.id ===
            previousActiveGroupId
        )
      : false;

  const activeGroupId =
    previousGroupStillExists
      ? previousActiveGroupId
      : primaryGroupId;

  const primaryWidgetId =
    primaryGroupId
      ? resolvedWidgets.find(
          widget =>
            widget.groupId ===
            primaryGroupId
        )?.id
      : resolvedWidgets[0]?.id;

  return {
    groups:
      resolvedGroups,

    widgets:
      resolvedWidgets,

    compactItems:
      resolveCompactItems(
        context,
        resolvedGroups,
        resolvedWidgets
      ),

    primaryGroupId,

    primaryWidgetId,

    activeGroupId,

    pageMode,

    intentType:
      intent.type
  };
}

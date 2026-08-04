'use client';

/* AJ_MS12_JOURNEY_SUMMARY_COMPLETION_V1 */

/* AJ_MS12_INTELLIGENCE_READABILITY_PASS_V1 */

/* AJ_MS12_GUIDED_COMPOSER_COMPOSITION_V4 */
/* AJ_MS12_PLAN_SNAPSHOT_HISTORY_ONLY */

/* AJ_MS12_VISIBLE_STATE_CLARIFICATION */

/* AJ_LIVING_INTELLIGENCE_PHASE_1 */
/* AJ_LIVING_INTELLIGENCE_UNIFIED_WORKSPACE */
/* AJ_LIVING_INTELLIGENCE_JOURNEY_EXPERIENCE */
/* AJ_LIVING_INTELLIGENCE_PHASE_2_PERSISTENCE */
/* AJ_LIVING_INTELLIGENCE_SOURCE_ORGANIZATION */
/* AJ_ASSISTANCE_WORKSPACE_STAGE_3 */
/* AJ_ASSISTANCE_WORKSPACE_STAGE_4 */

import * as React from 'react';

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bot,
  Check,
  ChevronDown,
  CircleDot,
  Clock3,
  Eraser,
  GitBranch,
  HelpCircle,
  History,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  Pencil,
  RotateCcw,
  Route,
  Sparkles,
  Target,
  TrendingUp,
  UserRound
} from 'lucide-react';

import type {
  AIAssistantApplicationView,
  AIAssistantAudience,
  AIAssistantFeedbackValue,
  AIAssistantMessageView,
  AIAssistantSessionView
} from '../contracts';

import type {
  AssistantSuggestedPrompt
} from '../contextualPrompts';

import {
  AssistantResponseCard
} from './AssistantResponseCard';
type GuidedAssistantExperienceProps = {
  audience: AIAssistantAudience;
  workspaceId: string;
  vendorProfileId: string | null;
  session: AIAssistantSessionView | null;
  prompts: AssistantSuggestedPrompt[];
  sending: boolean;
  activityLabel: string;
  reasoningOpen: boolean;
  onReasoningOpenChange(
    open: boolean
  ): void;
  onPrompt(prompt: string): void;
  onEditPrompt(prompt: string): void;
  onClearPrompt(): void;
  onRestorePlan(
    messageId: string
  ): Promise<void>;
  onStartFresh(): void;
  onApplied(
    messageId: string,
    application: AIAssistantApplicationView
  ): void;
  onFeedback(
    messageId: string,
    feedback: AIAssistantFeedbackValue
  ): void;
};

type JourneyStage =
  | 'begin'
  | 'understand'
  | 'refine'
  | 'decide';

type JourneySuggestionStatus =
  | 'COLLECTING'
  | 'READY'
  | 'AWAITING_REVIEW'
  | 'ACTIONABLE'
  | 'APPLIED'
  | 'DISMISSED';

type JourneySuggestion = {
  id: string;
  version: number;
  message: AIAssistantMessageView;
  type: string;
  title: string;
  summary: string;
  sourcePrompt: string;
  status: JourneySuggestionStatus;
  updatedAt: string;
  expectedOutcome: string;
};

type SuggestionSelection = {
  suggestionId: string;
  sessionId: string | null;
  latestSuggestionId: string | null;
};


type JourneyPlanComparison = {
  sourceChanged: boolean;
  summaryChanged: boolean;
  addedProducts: string[];
  removedProducts: string[];
  addedActions: string[];
  removedActions: string[];
  changedFields: string[];
};

function stringDifference(
  current: string[],
  previous: string[]
) {
  const previousValues =
    new Set(
      previous
    );

  return current.filter(
    value =>
      !previousValues.has(
        value
      )
  );
}

function comparePlans(
  previous: JourneySuggestion,
  current: JourneySuggestion
): JourneyPlanComparison {
  const previousPayload =
    previous.message.payload;

  const currentPayload =
    current.message.payload;

  const previousProducts =
    previousPayload?.products.map(
      product =>
        product.name
    ) ??
    [];

  const currentProducts =
    currentPayload?.products.map(
      product =>
        product.name
    ) ??
    [];

  const previousActions =
    previousPayload?.actions.map(
      action =>
        action.label
    ) ??
    [];

  const currentActions =
    currentPayload?.actions.map(
      action =>
        action.label
    ) ??
    [];

  const previousFields =
    new Map(
      (
        previousPayload
          ?.draftFields ??
        []
      ).map(
        field => [
          field.label,
          field.value
        ]
      )
    );

  const currentFields =
    new Map(
      (
        currentPayload
          ?.draftFields ??
        []
      ).map(
        field => [
          field.label,
          field.value
        ]
      )
    );

  const changedFields =
    [
      ...new Set([
        ...previousFields.keys(),
        ...currentFields.keys()
      ])
    ].filter(
      label =>
        previousFields.get(
          label
        ) !==
        currentFields.get(
          label
        )
    );

  return {
    sourceChanged:
      previous.sourcePrompt !==
      current.sourcePrompt,
    summaryChanged:
      previous.summary !==
      current.summary,
    addedProducts:
      stringDifference(
        currentProducts,
        previousProducts
      ),
    removedProducts:
      stringDifference(
        previousProducts,
        currentProducts
      ),
    addedActions:
      stringDifference(
        currentActions,
        previousActions
      ),
    removedActions:
      stringDifference(
        previousActions,
        currentActions
      ),
    changedFields
  };
}

function comparisonCount(
  comparison: JourneyPlanComparison
) {
  return [
    comparison.sourceChanged,
    comparison.summaryChanged,
    ...comparison.addedProducts,
    ...comparison.removedProducts,
    ...comparison.addedActions,
    ...comparison.removedActions,
    ...comparison.changedFields
  ].filter(
    Boolean
  ).length;
}


type JourneyReadinessTone =
  | 'needs-context'
  | 'review'
  | 'ready'
  | 'actionable'
  | 'completed';

type JourneyInsightModel = {
  understood: string[];
  changes: string[];
  assumptions: string[];
  unresolved: string[];
  strength: string;
  readiness: {
    label: string;
    detail: string;
    tone: JourneyReadinessTone;
  };
};

function compactUnique(
  values: Array<
    string |
    null |
    undefined
  >
) {
  return [
    ...new Set(
      values
        .map(
          value =>
            value?.trim() ??
            ''
        )
        .filter(
          Boolean
        )
    )
  ];
}

function matchingSectionBullets(
  suggestion: JourneySuggestion,
  terms: string[]
) {
  return (
    suggestion.message.payload
      ?.sections
      .filter(
        section => {
          const title =
            section.title
              .toLowerCase();

          return terms.some(
            term =>
              title.includes(
                term
              )
          );
        }
      )
      .flatMap(
        section =>
          section.bullets
      ) ??
    []
  );
}

function buildJourneyInsights(
  suggestion: JourneySuggestion,
  parent:
    JourneySuggestion |
    null,
  session:
    AIAssistantSessionView |
    null
): JourneyInsightModel {
  const payload =
    suggestion.message.payload;

  const understood =
    compactUnique([
      ...matchingSectionBullets(
        suggestion,
        [
          'what i understand',
          'understood',
          'recognition',
          'why these appeared',
          'meaningful differences',
          'core quantities'
        ]
      ),
      ...(
        payload?.metrics.map(
          metric =>
            `${metric.label}: ${metric.value}`
        ) ??
        []
      ),
      suggestion.summary
    ]).slice(
      0,
      5
    );

  const assumptions =
    compactUnique([
      ...(
        payload?.warnings ??
        []
      ),
      ...matchingSectionBullets(
        suggestion,
        [
          'assumption',
          'before checkout',
          'before use',
          'review',
          'warning',
          'caution',
          'authority',
          'governance',
          'reminder'
        ]
      )
    ]).slice(
      0,
      5
    );

  const assumptionSet =
    new Set(
      assumptions.map(
        item =>
          item.toLowerCase()
      )
    );

  const unresolved =
    compactUnique([
      ...matchingSectionBullets(
        suggestion,
        [
          'what i need',
          'still needed',
          'need next',
          'missing',
          'before checkout',
          'next step'
        ]
      ),
      suggestion.status ===
      'COLLECTING'
        ? suggestion.expectedOutcome
        : null
    ])
      .filter(
        item =>
          !assumptionSet.has(
            item.toLowerCase()
          )
      )
      .slice(
        0,
        5
      );

  const changes:
    string[] = [];

  let strength =
    'This is the first saved plan in the Journey.';

  if (parent) {
    const comparison =
      comparePlans(
        parent,
        suggestion
      );

    if (
      comparison.sourceChanged
    ) {
      changes.push(
        'The instruction or constraint changed.'
      );
    }

    if (
      comparison.summaryChanged
    ) {
      changes.push(
        'AJ rebuilt the recommendation summary.'
      );
    }

    if (
      comparison.addedProducts.length
    ) {
      changes.push(
        `Added ${comparison.addedProducts.join(
          ', '
        )}.`
      );
    }

    if (
      comparison.removedProducts.length
    ) {
      changes.push(
        `Removed ${comparison.removedProducts.join(
          ', '
        )}.`
      );
    }

    if (
      comparison.addedActions.length
    ) {
      changes.push(
        `Added action: ${comparison.addedActions.join(
          ', '
        )}.`
      );
    }

    if (
      comparison.removedActions.length
    ) {
      changes.push(
        `Removed action: ${comparison.removedActions.join(
          ', '
        )}.`
      );
    }

    if (
      comparison.changedFields.length
    ) {
      changes.push(
        `Updated ${comparison.changedFields.join(
          ', '
        )}.`
      );
    }

    strength =
      `Plan v${suggestion.version} reflects the latest active Journey context and current catalogue selection.`;
  }

  if (!changes.length) {
    changes.push(
      parent
        ? 'No structural change was detected; AJ preserved the plan and refreshed its context.'
        : 'This is the first saved plan, so there is no earlier version to compare.'
    );
  }

  let readiness:
    JourneyInsightModel[
      'readiness'
    ];

  if (
    session?.journeyStage ===
    'COMPLETED'
  ) {
    readiness = {
      label:
        'Completed',
      detail:
        'This Journey has a frozen completed outcome. Reopen it explicitly before making changes.',
      tone:
        'completed'
    };
  } else if (
    Boolean(
      session
        ?.journeyState
        ?.confirmedDecisions
        .length
    ) ||
    session
      ?.journeyLastTransition
      ?.reason ===
      'DECISION_CONFIRMED'
  ) {
    readiness = {
      label:
        'Plan accepted',
      detail:
        'The customer accepted the active plan. Operational reminders remain next steps, not blockers to the decision.',
      tone:
        'ready'
    };
  } else if (
    suggestion.status ===
    'APPLIED'
  ) {
    readiness = {
      label:
        'Completed',
      detail:
        'A governed action from this plan has already been applied.',
      tone:
        'completed'
    };
  } else if (
    suggestion.status ===
    'COLLECTING'
  ) {
    readiness = {
      label:
        'A little more detail',
      detail:
        unresolved[0] ??
        'AJ still needs one focused detail before it can complete the plan.',
      tone:
        'needs-context'
    };
  } else if (
    assumptions.length ||
    (
      payload?.draftFields.length ??
      0
    ) >
      0
  ) {
    readiness = {
      label:
        'Review required',
      detail:
        'The plan is useful, but its assumptions, warnings or prepared fields should be reviewed.',
      tone:
        'review'
    };
  } else if (
    (
      payload?.actions.length ??
      0
    ) >
      0
  ) {
    readiness = {
      label:
        'Ready for action',
      detail:
        'The plan has a governed next action available for your review.',
      tone:
        'actionable'
    };
  } else if (
    (
      payload?.confidence ??
      0
    ) >=
      0.75
  ) {
    readiness = {
      label:
        'Ready to decide',
      detail:
        'AJ has enough context for you to choose, refine or continue.',
      tone:
        'ready'
    };
  } else {
    readiness = {
      label:
        'Refine once more',
      detail:
        'The plan is usable, but another instruction would improve confidence.',
      tone:
        'review'
    };
  }

  return {
    understood,
    changes:
      compactUnique(
        changes
      ).slice(
        0,
        5
      ),
    assumptions,
    unresolved,
    strength,
    readiness
  };
}

function readinessClasses(
  tone: JourneyReadinessTone
) {
  if (
    tone ===
    'completed'
  ) {
    return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
  }

  if (
    tone ===
    'actionable' ||
    tone ===
    'ready'
  ) {
    return 'border-accent/35 bg-accent/12 text-foreground';
  }

  if (
    tone ===
    'needs-context'
  ) {
    return 'border-amber-500/35 bg-amber-500/10 text-amber-700 dark:text-amber-300';
  }

  return 'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300';
}

const journeyStages: Array<{
  id: JourneyStage;
  label: string;
}> = [
  {
    id: 'begin',
    label: 'Begin'
  },
  {
    id: 'understand',
    label: 'Understand'
  },
  {
    id: 'refine',
    label: 'Refine'
  },
  {
    id: 'decide',
    label: 'Decide'
  }
];

function readableType(
  value: string
) {
  return value
    .replaceAll(
      '_',
      ' '
    )
    .toLowerCase()
    .replace(
      /\b[a-z]/g,
      character =>
        character.toUpperCase()
    );
}

function suggestionStatus(
  message: AIAssistantMessageView
): JourneySuggestionStatus {
  if (
    message.feedback ===
    'DISMISSED'
  ) {
    return 'DISMISSED';
  }

  if (
    message.applications.some(
      application =>
        application.status ===
        'APPLIED'
    )
  ) {
    return 'APPLIED';
  }

  const payload =
    message.payload;

  if (!payload) {
    return 'READY';
  }

  if (
    payload.sections.some(
      section =>
        section.title
          .toLowerCase()
          .includes(
            'what i need'
          )
    )
  ) {
    return 'COLLECTING';
  }

  if (
    payload.actions.length
  ) {
    return 'ACTIONABLE';
  }

  if (
    payload.warnings.length ||
    payload.draftFields.length
  ) {
    return 'AWAITING_REVIEW';
  }

  return 'READY';
}

function statusLabel(
  status: JourneySuggestionStatus
) {
  if (
    status ===
    'AWAITING_REVIEW'
  ) {
    return 'Review';
  }

  if (
    status ===
    'COLLECTING'
  ) {
    return 'Needs detail';
  }

  if (
    status ===
    'ACTIONABLE'
  ) {
    return 'Ready to use';
  }

  return status
    .toLowerCase()
    .replace(
      /\b[a-z]/g,
      character =>
        character.toUpperCase()
    );
}

function expectedOutcome(
  message: AIAssistantMessageView
) {
  const payload =
    message.payload;

  if (!payload) {
    return message.content;
  }

  const action =
    payload.actions[0];

  if (action) {
    return action.label;
  }

  if (
    payload.products.length
  ) {
    return `${payload.products.length} products suggested`;
  }

  if (
    payload.draftFields.length
  ) {
    return `${payload.draftFields.length} details prepared`;
  }

  const next =
    payload.sections.find(
      section =>
        section.title
          .toLowerCase()
          .includes(
            'what i need'
          )
    );

  if (
    next?.bullets[0]
  ) {
    return next.bullets[0];
  }

  return 'Review and refine this suggestion';
}

function buildSuggestions(
  messages: AIAssistantMessageView[],
  fallbackPrompt: string
): JourneySuggestion[] {
  const suggestions: JourneySuggestion[] =
    [];

  let sourcePrompt =
    fallbackPrompt;

  let localVersion =
    0;

  for (
    const message of
    messages
  ) {
    if (
      message.role ===
      'USER'
    ) {
      sourcePrompt =
        message.content;

      continue;
    }

    if (
      message.role !==
        'ASSISTANT' ||
      !message.isPlanSnapshot
    ) {
      continue;
    }

    localVersion +=
      1;

    suggestions.push({
      id:
        message.id,
      version:
        message.journeyVersion ??
        localVersion,
      message,
      type:
        message.payload
          ?.outputType ??
        'ASSISTANT_UPDATE',
      title:
        message.payload
          ?.headline ??
        'AJ suggestion',
      summary:
        message.payload
          ?.summary ??
        message.content,
      sourcePrompt:
        sourcePrompt ||
        fallbackPrompt ||
        'Journey context',
      status:
        suggestionStatus(
          message
        ),
      updatedAt:
        message.createdAt,
      expectedOutcome:
        expectedOutcome(
          message
        )
    });
  }

  return suggestions.reverse();
}

function stageIndex(
  stage: JourneyStage
) {
  return journeyStages.findIndex(
    item =>
      item.id ===
      stage
  );
}

function signalLabel(
  suggestion: JourneySuggestion
) {
  const payload =
    suggestion.message.payload;

  if (!payload) {
    return 'AJ prepared a direct response';
  }

  const signals: string[] =
    [];

  if (
    payload.products.length
  ) {
    signals.push(
      `${payload.products.length} products`
    );
  }

  if (
    payload.draftFields.length
  ) {
    signals.push(
      `${payload.draftFields.length} prepared details`
    );
  }

  if (
    payload.actions.length
  ) {
    signals.push(
      `${payload.actions.length} ready action${
        payload.actions.length ===
        1
          ? ''
          : 's'
      }`
    );
  }

  if (
    payload.warnings.length
  ) {
    signals.push(
      `${payload.warnings.length} caution${
        payload.warnings.length ===
        1
          ? ''
          : 's'
      }`
    );
  }

  return signals.length
    ? signals.join(
        ' · '
      )
    : `Confidence ${Math.round(
        payload.confidence *
          100
      )}%`;
}/* AJ_MS12_VISIBLE_EXPLANATION_WIRING_V4 */
function isVisiblePlanExplanationMessage(
  message:
    AIAssistantMessageView |
    null |
    undefined
) {
  const payload =
    message?.payload;

  return Boolean(
    message?.role ===
      'ASSISTANT' &&
    !message.isPlanSnapshot &&
    payload &&
    (
      /why this plan fits your journey/i.test(
        payload.headline
      ) ||
      /explanation reads the active plan/i.test(
        payload.summary
      )
    )
  );
}

function latestVisiblePlanExplanation(
  messages:
    AIAssistantMessageView[]
) {
  const latestAssistant =
    messages
      .filter(
        message =>
          message.role ===
          'ASSISTANT'
      )
      .reduce<
        AIAssistantMessageView |
        null
      >(
        (
          latest,
          candidate
        ) => {
          if (!latest) {
            return candidate;
          }

          return new Date(
            candidate.createdAt
          ).getTime() >=
            new Date(
              latest.createdAt
            ).getTime()
            ? candidate
            : latest;
        },
        null
      );

  return isVisiblePlanExplanationMessage(
    latestAssistant
  )
    ? latestAssistant
    : null;
}

function sourcePromptBeforeMessage(
  messages:
    AIAssistantMessageView[],
  messageId:
    string |
    null
) {
  if (!messageId) {
    return '';
  }

  const ordered =
    [...messages].sort(
      (left, right) =>
        new Date(
          left.createdAt
        ).getTime() -
        new Date(
          right.createdAt
        ).getTime()
    );

  const messageIndex =
    ordered.findIndex(
      message =>
        message.id ===
        messageId
    );

  for (
    let index =
      messageIndex - 1;
    index >= 0;
    index -= 1
  ) {
    if (
      ordered[index]?.role ===
      'USER'
    ) {
      return ordered[index]
        .content;
    }
  }

  return '';
}



export function GuidedAssistantExperience({
  audience,
  workspaceId,
  vendorProfileId,
  session,
  prompts,
  sending,
  activityLabel,
  reasoningOpen,
  onReasoningOpenChange,
  onPrompt,
  onEditPrompt,
  onClearPrompt,
  onRestorePlan,
  onApplied,
  onFeedback
}: GuidedAssistantExperienceProps) {
  const [
    selection,
    setSelection
  ] =
    React.useState<
      SuggestionSelection |
      null
    >(
      null
    );

  const [
    historyOpen,
    setHistoryOpen
  ] =
    React.useState(
      false
    );

  const [
    restoringPlanId,
    setRestoringPlanId
  ] =
    React.useState<
      string |
      null
    >(
      null
    );

  const messages =
    React.useMemo(
      () =>
        session?.messages ??
        [],
      [
        session?.messages
      ]
    );

  const suggestions =
    React.useMemo(
      () =>
        buildSuggestions(
          messages,
          session?.journeyGoal ??
            session?.title ??
            ''
        ),
      [
        messages,
        session?.journeyGoal,
        session?.title
      ]
    );

  const latestSuggestion =
    suggestions.find(
      suggestion =>
        suggestion.id ===
        session?.activePlanMessageId
    ) ??
    suggestions[0] ??
    null;

  const selectedSuggestion =
    selection &&
    selection.sessionId ===
      (session?.id ?? null) &&
    selection.latestSuggestionId ===
      (latestSuggestion?.id ?? null)
      ? suggestions.find(
          suggestion =>
            suggestion.id ===
            selection.suggestionId
        ) ??
        null
      : null;

  const activeSuggestion =
    selectedSuggestion ??
    latestSuggestion;

  const viewingLatest =
    Boolean(
      activeSuggestion &&
      latestSuggestion &&
      activeSuggestion.id ===
        latestSuggestion.id
    );

  const latestPlanExplanationMessage =
    React.useMemo(
      () =>
        latestVisiblePlanExplanation(
          messages
        ),
      [
        messages
      ]
    );

  const latestPlanExplanationPrompt =
    React.useMemo(
      () =>
        sourcePromptBeforeMessage(
          messages,
          latestPlanExplanationMessage
            ?.id ??
            null
        ),
      [
        latestPlanExplanationMessage
          ?.id,
        messages
      ]
    );

  const displayingPlanExplanation =
    Boolean(
      viewingLatest &&
      latestPlanExplanationMessage
    );

  const displayedResponseMessage =
    displayingPlanExplanation
      ? latestPlanExplanationMessage
      : activeSuggestion
          ?.message ??
        null;

  const displayedSourcePrompt =
    displayingPlanExplanation
      ? latestPlanExplanationPrompt ||
        'Explain the active plan'
      : activeSuggestion
          ?.sourcePrompt ??
        '';

  const comparison =
    React.useMemo(
      () =>
        activeSuggestion &&
        latestSuggestion &&
        activeSuggestion.id !==
          latestSuggestion.id
          ? comparePlans(
              activeSuggestion,
              latestSuggestion
            )
          : null,
      [
        activeSuggestion,
        latestSuggestion
      ]
    );

  const parentSuggestion =
    React.useMemo(
      () => {
        if (
          !activeSuggestion
        ) {
          return null;
        }

        const parentId =
          activeSuggestion.message
            .previousPlanMessageId;

        if (parentId) {
          return (
            suggestions.find(
              suggestion =>
                suggestion.id ===
                parentId
            ) ??
            null
          );
        }

        return (
          suggestions.find(
            suggestion =>
              suggestion.version ===
              activeSuggestion.version -
                1
          ) ??
          null
        );
      },
      [
        activeSuggestion,
        suggestions
      ]
    );

  const insights =
    React.useMemo(
      () =>
        activeSuggestion
          ? buildJourneyInsights(
              activeSuggestion,
              parentSuggestion,
              session
            )
          : null,
      [
        activeSuggestion,
        parentSuggestion,
        session
      ]
    );

  const needsMore =
    activeSuggestion?.status ===
    'COLLECTING';

  const currentStage:
    JourneyStage =
    sending
      ? 'refine'
      : needsMore
        ? 'understand'
        : activeSuggestion
          ? 'decide'
          : messages.length
            ? 'understand'
            : 'begin';

  const currentIndex =
    stageIndex(
      currentStage
    );

  function openSuggestion(
    suggestion: JourneySuggestion
  ) {
    const latest =
      suggestion.id ===
      latestSuggestion?.id;

    setSelection(
      latest
        ? null
        : {
            suggestionId:
              suggestion.id,
            sessionId:
              session?.id ??
              null,
            latestSuggestionId:
              latestSuggestion?.id ??
              null
          }
    );

    setHistoryOpen(
      false
    );
  }

  async function restoreSuggestion(
    suggestion:
      JourneySuggestion
  ) {
    if (
      restoringPlanId ||
      suggestion.id ===
        latestSuggestion?.id ||
      !window.confirm(
        `Restore Plan v${suggestion.version} as the current plan? Your newer versions will remain in History.`
      )
    ) {
      return;
    }

    setRestoringPlanId(
      suggestion.id
    );

    try {
      await onRestorePlan(
        suggestion.id
      );

      setSelection(
        null
      );

      setHistoryOpen(
        false
      );
    } finally {
      setRestoringPlanId(
        null
      );
    }
  }

  function editSource(
    value: string
  ) {
    onEditPrompt(
      value
    );

    setHistoryOpen(
      false
    );
  }

  function resetView() {
    setSelection(
      null
    );

    setHistoryOpen(
      false
    );

    onClearPrompt();
  }

  function clearHistoryView() {
    setSelection(
      null
    );

    setHistoryOpen(
      false
    );
  }

  return (
    <div className="min-h-0 flex-1 px-3 py-4 sm:px-4 sm:py-5">


      <div className="mx-auto max-w-[86rem] space-y-5">
        {/* AJ_MS12_RELOCATED_JOURNEY_PROGRESS */}

        {!messages.length ? (
          <section className="rounded-[1.75rem] border border-border/60 bg-card/55 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-accent" />

              <div>
                <h3 className="font-semibold">
                  Choose a starting point
                </h3>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  AJ suggests and explains. You make the final choice.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {prompts
                .slice(
                  0,
                  8
                )
                .map(
                  suggestion => (
                    <button
                      key={
                        suggestion.id
                      }
                      type="button"
                      disabled={
                        sending
                      }
                      onClick={() =>
                        onPrompt(
                          suggestion.prompt
                        )
                      }
                      className="group flex min-w-0 items-center justify-between gap-3 rounded-2xl border border-border/60 bg-background/60 p-4 text-left transition hover:border-accent/45 hover:bg-accent/8 hover:shadow-sm active:scale-[0.99] disabled:opacity-50">
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold leading-6">
                          {
                            suggestion.label
                          }
                        </span>

                        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                          {
                            suggestion.description
                          }
                        </span>
                      </span>

                      <ArrowRight className="size-4 shrink-0 text-accent transition group-hover:translate-x-0.5" />
                    </button>
                  )
                )}
            </div>
          </section>
        ) : null}

        {activeSuggestion ? (
          <>
            <section className="relative overflow-hidden rounded-[1.6rem] border border-primary/35 bg-primary/8 p-4 shadow-sm ring-1 ring-primary/10 sm:p-5">
              <div className="absolute inset-y-0 left-0 w-1.5 bg-primary" />

              <div className="flex flex-wrap items-start justify-between gap-3 pl-2">
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-xs font-semibold text-primary">
                    <UserRound className="size-3.5" />

                    {
                      displayingPlanExplanation
                        ? 'Latest question'
                        : 'Latest direction'
                    }
                  </p>

                  <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-foreground">
                    “{
                      displayedSourcePrompt
                    }”
                  </p>

                  <p className="mt-2 text-xs text-muted-foreground">
                    {
                      displayingPlanExplanation
                        ? `AJ explained the active Plan v${activeSuggestion.version} without creating another saved version.`
                        : viewingLatest
                          ? session?.journeyLastTransition?.reason === 'DECISION_CONFIRMED'
                          ? `AJ recorded this decision without changing Plan v${activeSuggestion.version}.`
                          : `AJ used this direction together with all details saved in this Journey to prepare Plan v${activeSuggestion.version}.`
                          : `This direction belongs to the saved context for Plan v${activeSuggestion.version}.`
                    }
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      editSource(
                        displayedSourcePrompt
                      )
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-primary/25 bg-background/75 px-3 text-xs font-semibold transition hover:bg-primary/10"
                    title="Copy this instruction into the edit field">
                    <Pencil className="size-3.5" />

                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={
                      resetView
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-border/70 bg-background/75 px-3 text-xs font-semibold transition hover:bg-muted"
                    title="Return to the latest plan and clear temporary changes">
                    <RotateCcw className="size-3.5" />

                    Reset
                  </button>
                </div>
              </div>
            </section>

            {comparison ? (
              <section className="rounded-[1.65rem] border border-amber-500/30 bg-amber-500/8 p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-semibold text-amber-600">
                      <GitBranch className="size-3.5" />

                      Comparing Plan v{
                        activeSuggestion.version
                      } with current Plan v{
                        latestSuggestion?.version
                      }
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {
                        comparisonCount(
                          comparison
                        )
                      } tracked change{
                        comparisonCount(
                          comparison
                        ) ===
                        1
                          ? ''
                          : 's'
                      } between these saved versions.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={
                      restoringPlanId ===
                      activeSuggestion.id
                    }
                    onClick={() =>
                      void restoreSuggestion(
                        activeSuggestion
                      )
                    }
                    className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                    {restoringPlanId ===
                    activeSuggestion.id ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="size-3.5" />
                    )}

                    Restore this version
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <article className="rounded-2xl border border-border/55 bg-card/70 p-4">
                    <p className="text-[11px] font-semibold text-primary">
                      Instruction
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6">
                      {
                        comparison.sourceChanged
                          ? 'The instruction changed between these plans.'
                          : 'Both plans came from the same instruction.'
                      }
                    </p>
                  </article>

                  <article className="rounded-2xl border border-border/55 bg-card/70 p-4">
                    <p className="text-[11px] font-semibold text-accent">
                      Plan content
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6">
                      {
                        comparison.summaryChanged
                          ? 'AJ changed the plan summary.'
                          : 'The main plan summary remained the same.'
                      }
                    </p>
                  </article>

                  <article className="rounded-2xl border border-border/55 bg-card/70 p-4">
                    <p className="text-[11px] font-semibold text-emerald-600">
                      Added in current
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6">
                      {
                        [
                          ...comparison.addedProducts,
                          ...comparison.addedActions
                        ].length
                          ? [
                              ...comparison.addedProducts,
                              ...comparison.addedActions
                            ].join(
                              ', '
                            )
                          : 'No new products or actions.'
                      }
                    </p>
                  </article>

                  <article className="rounded-2xl border border-border/55 bg-card/70 p-4">
                    <p className="text-[11px] font-semibold text-destructive">
                      Removed or changed
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6">
                      {
                        [
                          ...comparison.removedProducts,
                          ...comparison.removedActions,
                          ...comparison.changedFields
                        ].length
                          ? [
                              ...comparison.removedProducts,
                              ...comparison.removedActions,
                              ...comparison.changedFields
                            ].join(
                              ', '
                            )
                          : 'No tracked removals or field changes.'
                      }
                    </p>
                  </article>
                </div>
              </section>
            ) : null}

            <section id="aj-current-plan-response" className="scroll-mt-6 overflow-hidden rounded-[1.85rem] border border-accent/45 bg-card/80 shadow-[0_24px_70px_-44px_color-mix(in_oklab,var(--accent)_70%,transparent)] ring-2 ring-accent/10">
              <header className="relative flex flex-wrap items-center justify-between gap-3 border-b border-accent/15 bg-accent/7 px-4 py-3 sm:px-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                      viewingLatest
                        ? 'border-accent/40 bg-accent/18 text-foreground'
                        : 'border-amber-500/30 bg-amber-500/10 text-foreground'
                    }`}>
                      {
                        displayingPlanExplanation
                          ? 'Plan explanation'
                          : viewingLatest
                            ? 'Current AJ answer'
                            : 'Earlier AJ answer'
                      }
                    </span>

                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Plan v{
                        activeSuggestion.version
                      } · {
                        readableType(
                          activeSuggestion.type
                        )
                      }
                    </span>
                  </div>

                  <p className="mt-2 flex items-center gap-2 text-xs font-semibold">
                    <Check className="size-3.5 text-accent" />

                    {
                      displayingPlanExplanation
                        ? 'Explanation only · active Plan unchanged'
                        : activeSuggestion.expectedOutcome
                    }
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!viewingLatest ? (
                    <>
                      <button
                        type="button"
                        disabled={
                          restoringPlanId ===
                          activeSuggestion.id
                        }
                        onClick={() =>
                          void restoreSuggestion(
                            activeSuggestion
                          )
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground disabled:opacity-50">
                        {restoringPlanId ===
                        activeSuggestion.id ? (
                          <LoaderCircle className="size-3.5 animate-spin" />
                        ) : (
                          <RotateCcw className="size-3.5" />
                        )}

                        Restore as current
                      </button>

                      <button
                        type="button"
                        onClick={
                          resetView
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-full border border-accent/30 bg-background/75 px-3 text-xs font-semibold">
                        <ArrowLeft className="size-3.5" />

                        Current plan
                      </button>
                    </>
                  ) : null}

                  {suggestions.length > 1 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setHistoryOpen(
                          current =>
                            !current
                        )
                      }
                      className={`inline-flex h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
                        historyOpen
                          ? 'border-accent/50 bg-accent/15 ring-2 ring-accent/10'
                          : 'border-border/70 bg-background/75 hover:border-accent/35'
                      }`}
                      aria-expanded={
                        historyOpen
                      }>
                      <History className="size-3.5" />

                      History {
                        suggestions.length
                      }

                      <ChevronDown
                        className={`size-3.5 transition ${
                          historyOpen
                            ? 'rotate-180'
                            : ''
                        }`}
                      />
                    </button>
                  ) : null}
                </div>

                {historyOpen ? (
                  <div className="absolute right-4 top-[calc(100%+0.5rem)] z-30 w-[min(28rem,calc(100vw-3rem))] overflow-hidden rounded-2xl border border-accent/30 bg-popover p-2 shadow-2xl ring-1 ring-accent/10">
                    <div className="flex items-start justify-between gap-3 px-2 py-2">
                      <div>
                        <p className="text-xs font-semibold text-primary">
                          Journey history
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Every answer shows the instruction it came from.
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={
                            resetView
                          }
                          className="grid size-8 place-items-center rounded-full border border-border/60 bg-background/70 hover:bg-muted"
                          title="Reset to the current plan">
                          <RotateCcw className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={
                            clearHistoryView
                          }
                          className="grid size-8 place-items-center rounded-full border border-border/60 bg-background/70 hover:bg-muted"
                          title="Clear the history selection from this view">
                          <Eraser className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[26rem] space-y-3 overflow-y-auto">
                      {suggestions.map(
                        suggestion => {
                          const selected =
                            suggestion.id ===
                            activeSuggestion.id;

                          const latest =
                            suggestion.id ===
                            latestSuggestion?.id;

                          return (
                            <div
                              key={
                                suggestion.id
                              }
                              className={`relative overflow-hidden rounded-xl border transition ${
                                selected
                                  ? 'border-accent/55 bg-accent/12 ring-2 ring-accent/10'
                                  : 'border-border/45 bg-background/45 hover:border-accent/25 hover:bg-muted/35'
                              }`}>
                              <div
                                className={`absolute inset-y-0 left-0 w-1 ${
                                  selected
                                    ? 'bg-accent'
                                    : 'bg-transparent'
                                }`}
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  openSuggestion(
                                    suggestion
                                  )
                                }
                                className="w-full p-3 pl-4 text-left">
                                <span className="flex items-center justify-between gap-3">
                                  <span className="text-[11px] font-semibold text-muted-foreground">
                                    Plan v{
                                      suggestion.version
                                    }
                                  </span>

                                  <span className="flex items-center gap-1.5">
                                    {selected ? (
                                      <span className="rounded-full border border-accent/30 bg-accent/15 px-2 py-0.5 text-[10px] font-semibold ">
                                        Viewing
                                      </span>
                                    ) : null}

                                    {latest ? (
                                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
                                        Current
                                      </span>
                                    ) : null}
                                  </span>
                                </span>

                                <span className="mt-1 block line-clamp-1 text-xs font-semibold">
                                  {
                                    suggestion.title
                                  }
                                </span>

                                <span className="mt-2 block rounded-lg border border-primary/15 bg-primary/7 px-2.5 py-2">
                                  <span className="flex items-center gap-1.5 text-[10px] font-semibold text-primary">
                                    <UserRound className="size-2.5" />

                                    Answered from
                                  </span>

                                  <span className="mt-1 block line-clamp-2 text-xs leading-5 text-foreground/80">
                                    {
                                      suggestion.sourcePrompt
                                    }
                                  </span>
                                </span>

                                <span className="mt-2 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                                  <span>
                                    {
                                      statusLabel(
                                        suggestion.status
                                      )
                                    }
                                  </span>

                                  <span className="flex items-center gap-1">
                                    <Clock3 className="size-2.5" />

                                    {
                                      new Date(
                                        suggestion.updatedAt
                                      ).toLocaleTimeString(
                                        'en-NG',
                                        {
                                          hour:
                                            '2-digit',
                                          minute:
                                            '2-digit'
                                        }
                                      )
                                    }
                                  </span>
                                </span>
                              </button>

                              <div className="flex flex-wrap justify-end gap-1 border-t border-border/40 px-2 py-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    openSuggestion(
                                      suggestion
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                                  title={
                                    latest
                                      ? 'Open the current plan'
                                      : 'Compare this plan with the current plan'
                                  }>
                                  <GitBranch className="size-3" />

                                  {
                                    latest
                                      ? 'Open'
                                      : 'Compare'
                                  }
                                </button>

                                {!latest ? (
                                  <button
                                    type="button"
                                    disabled={
                                      restoringPlanId ===
                                      suggestion.id
                                    }
                                    onClick={() =>
                                      void restoreSuggestion(
                                        suggestion
                                      )
                                    }
                                    className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold text-primary hover:bg-primary/10 disabled:opacity-50"
                                    title="Restore this saved version as the current plan">
                                    {restoringPlanId ===
                                    suggestion.id ? (
                                      <LoaderCircle className="size-3 animate-spin" />
                                    ) : (
                                      <RotateCcw className="size-3" />
                                    )}

                                    Restore
                                  </button>
                                ) : null}

                                <button
                                  type="button"
                                  onClick={() =>
                                    editSource(
                                      suggestion.sourcePrompt
                                    )
                                  }
                                  className="inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[11px] font-semibold text-primary hover:bg-primary/10"
                                  title="Edit the instruction that produced this plan">
                                  <Pencil className="size-3" />

                                  Edit source
                                </button>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                ) : null}
              </header>

              <div className="p-4 sm:p-5">
                <AssistantResponseCard
                  audience={
                    audience
                  }
                  workspaceId={
                    workspaceId
                  }
                  vendorProfileId={
                    vendorProfileId
                  }
                  message={
                    displayedResponseMessage ??
                    activeSuggestion.message
                  }
                  onApplied={
                    onApplied
                  }
                  onFeedback={
                    onFeedback
                  }
/>
              </div>
            </section>

            {insights && reasoningOpen ? (
              <section id="aj-journey-reasoning" className="scroll-mt-6 overflow-hidden rounded-[1.7rem] border border-violet-500/30 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--accent)_14%,transparent),transparent_58%)] shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-violet-500/15 p-5 sm:p-6">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-semibold text-violet-500">
                      <Lightbulb className="size-3.5" />

                      What I’m keeping in mind
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      The current understanding, assumptions, open items and decision readiness for this active plan.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-[11px] font-semibold ">
                      Plan v{
                        activeSuggestion.version
                      }
                    </span>

                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                      readinessClasses(
                        insights.readiness.tone
                      )
                    }`}>
                      {
                        insights.readiness.label
                      }
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 p-5 sm:p-6 lg:grid-cols-3">
                  <article className="rounded-2xl border border-border/55 bg-card/75 p-4">
                    <p className="flex items-center gap-2 text-[11px] font-semibold text-accent">
                      <Target className="size-3.5" />

                      What AJ understood
                    </p>

                    <ul className="mt-3 space-y-3">
                      {insights.understood.map(
                        item => (
                          <li
                            key={
                              item
                            }
                            className="flex gap-2 text-sm font-medium leading-6 text-foreground/85">
                            <Check className="mt-1 size-3 shrink-0 text-accent" />

                            <span>
                              {
                                item
                              }
                            </span>
                          </li>
                        )
                      )}
                    </ul>
                  </article>



                  <article className="rounded-2xl border border-border/55 bg-card/75 p-4">
                    <p className="flex items-center gap-2 text-[11px] font-semibold text-amber-600">
                      <AlertTriangle className="size-3.5" />

                      Assumptions and cautions
                    </p>

                    {insights.assumptions.length ? (
                      <ul className="mt-3 space-y-3">
                        {insights.assumptions.map(
                          item => (
                            <li
                              key={
                                item
                              }
                              className="flex gap-2 text-sm font-medium leading-6 text-foreground/85">
                              <CircleDot className="mt-1 size-3 shrink-0 text-amber-600" />

                              <span>
                                {
                                  item
                                }
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                        No explicit warning or assumption was attached to this plan.
                      </p>
                    )}
                  </article>

                  <article className="rounded-2xl border border-border/55 bg-card/75 p-4">
                    <p className="flex items-center gap-2 text-[11px] font-semibold text-violet-500">
                      <HelpCircle className="size-3.5" />

                      Still unresolved
                    </p>

                    {insights.unresolved.length ? (
                      <ul className="mt-3 space-y-3">
                        {insights.unresolved.map(
                          item => (
                            <li
                              key={
                                item
                              }
                              className="flex gap-2 text-sm font-medium leading-6 text-foreground/85">
                              <CircleDot className="mt-1 size-3 shrink-0 text-violet-500" />

                              <span>
                                {
                                  item
                                }
                              </span>
                            </li>
                          )
                        )}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">
                        AJ has not identified a blocking unanswered question.
                      </p>
                    )}
                  </article>
                </div>

                <div className="grid gap-3 border-t border-violet-500/15 bg-background/35 p-5 sm:p-6 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <p className="flex items-center gap-2 text-[11px] font-semibold text-emerald-600">
                      <BadgeCheck className="size-3.5" />

                      Current plan readiness
                    </p>

                    <p className="mt-2 text-sm font-semibold leading-6">
                      {
                        insights.strength
                      }
                    </p>

                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {
                        insights.readiness.detail
                      }
                    </p>
                  </div>

                  <div className={`rounded-2xl border px-4 py-3 text-center ${
                    readinessClasses(
                      insights.readiness.tone
                    )
                  }`}>
                    <p className="text-[11px] font-semibold ">
                      Decision readiness
                    </p>

                    <p className="mt-1 text-sm font-semibold">
                      {
                        insights.readiness.label
                      }
                    </p>
                  </div>
                </div>
                              <div className="flex justify-end border-t border-violet-500/15 bg-background/25 px-5 py-3 sm:px-6">
                  <button
                    type="button"
                    onClick={() =>
                      onReasoningOpenChange(
                        false
                      )
                    }
                    className="h-9 rounded-full border border-border/70 bg-background/70 px-4 text-xs font-semibold transition hover:border-accent/35 hover:bg-accent/8">
                    Collapse full reasoning
                  </button>
                </div>
</section>
            ) : null}
          </>
        ) : null}


        {sending ? (
          <div
            role="status"
            aria-live="polite"
            className="rounded-[1.5rem] border border-accent/35 bg-accent/10 p-4 shadow-sm ring-1 ring-accent/10">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
                <LoaderCircle className="size-4 animate-spin" />
              </span>

              <div>
                <p className="text-xs font-semibold text-accent">
                  Updating this journey
                </p>

                <p className="mt-1 text-sm font-semibold">
                  {
                    activityLabel
                  }
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

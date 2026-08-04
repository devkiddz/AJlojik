'use client';

/* AJ_MS12_INTELLIGENCE_READABILITY_PASS_V1 */

/* AJ_MS12_STICKY_JOURNEY_BUCKET_V4 */

/* AJ_MS12_CALM_JOURNEY_NAVIGATION_V3 */
/* AJ_MS12_JOURNEY_BUCKET_MANAGEMENT */

import {
  useMemo,
  useState
} from 'react';

import {
  ChevronRight,
  Clock3,
  MessageSquarePlus,
  PanelLeftClose,
  Search,
  Trash2
} from 'lucide-react';

import type {
  AIAssistantSessionSummary
} from '../contracts';

type JourneyNavigationRailProps = {
  sessions:
    AIAssistantSessionSummary[];
  activeSessionId:
    string |
    null;
  loading:
    boolean;
  deletingJourneyId:
    string |
    null;
  clearingJourneyBucket:
    boolean;
  onSelect(
    sessionId:
      string
  ): void;
  onDelete(
    sessionId:
      string,
    title:
      string
  ): void;
  onClearAll(): void;
  onStartNew(): void;
  onClose(): void;
};

function cleanText(
  value:
    string
) {
  return value
    .replace(
      /\s+/g,
      ' '
    )
    .trim();
}

function isGenericTitle(
  value:
    string |
    null |
    undefined
) {
  if (!value) {
    return true;
  }

  const normalized =
    value
      .toLowerCase()
      .replace(
        /[^a-z0-9\s]/g,
        ''
      )
      .replace(
        /\s+/g,
        ' '
      )
      .trim();

  return [
    'help me think this through',
    'help me get started',
    'start a new journey',
    'new journey',
    'lets define this journey',
    'let us define this journey',
    'define this journey'
  ].includes(
    normalized
  );
}

function journeyTitle(
  session:
    AIAssistantSessionSummary
) {
  const objective =
    session.journeyState
      ?.objective;

  const selected =
    objective &&
    cleanText(
      objective
    ).length >=
      6
      ? objective
      : session.journeyGoal &&
        !isGenericTitle(
          session.journeyGoal
        )
        ? session.journeyGoal
        : session.title;

  const cleaned =
    cleanText(
      (
        selected ??
        'Untitled Journey'
      )
        .replace(
          /^(?:please\s+)?(?:can|could|would)\s+you\s+/i,
          ''
        )
        .replace(
          /^(?:please\s+)?help\s+me\s+(?:to\s+)?/i,
          ''
        )
        .replace(
          /^i\s+(?:want|need|would like)\s+(?:to\s+)?/i,
          ''
        )
        .replace(
          /[.!?]+$/g,
          ''
        )
    );

  const title =
    cleaned
      ? cleaned.charAt(
          0
        ).toUpperCase() +
        cleaned.slice(
          1
        )
      : 'Untitled Journey';

  return title.length <=
    58
      ? title
      : `${title.slice(
          0,
          55
        )}…`;
}

function stageLabel(
  session:
    AIAssistantSessionSummary
) {
  switch (
    session.journeyStage
  ) {
    case 'UNDERSTANDING':
      return 'Getting the details';
    case 'PLANNING':
      return 'Putting it together';
    case 'REFINING':
      return 'Making it fit';
    case 'AWAITING_DECISION':
      return 'Waiting for your choice';
    case 'READY':
      return 'Ready when you are';
    case 'COMPLETED':
      return 'Completed';
    default:
      return 'In progress';
  }
}

function relativeTime(
  value:
    string
) {
  const date =
    new Date(
      value
    );

  const difference =
    Date.now() -
    date.getTime();

  if (
    !Number.isFinite(
      difference
    ) ||
    difference <
      0
  ) {
    return date.toLocaleString(
      'en-NG'
    );
  }

  const minutes =
    Math.floor(
      difference /
      60000
    );

  if (
    minutes <
    1
  ) {
    return 'Updated now';
  }

  if (
    minutes <
    60
  ) {
    return `Updated ${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes /
      60
    );

  if (
    hours <
    24
  ) {
    return `Updated ${hours}h ago`;
  }

  const days =
    Math.floor(
      hours /
      24
    );

  if (
    days <
    7
  ) {
    return `Updated ${days}d ago`;
  }

  return date.toLocaleDateString(
    'en-NG',
    {
      day:
        '2-digit',
      month:
        'short',
      year:
        'numeric'
    }
  );
}

function JourneyRow({
  session,
  active,
  deleting,
  disabled,
  onSelect,
  onDelete
}: {
  session:
    AIAssistantSessionSummary;
  active:
    boolean;
  deleting:
    boolean;
  disabled:
    boolean;
  onSelect(
    sessionId:
      string
  ): void;
  onDelete(
    sessionId:
      string,
    title:
      string
  ): void;
}) {
  const title =
    journeyTitle(
      session
    );

  return (
    <div className={`group flex items-center gap-1 rounded-2xl transition ${
      active
        ? 'bg-accent/10 ring-1 ring-accent/20'
        : 'hover:bg-muted/45'
    }`}>
      <button
        type="button"
        disabled={
          disabled
        }
        onClick={() =>
          onSelect(
            session.id
          )
        }
        aria-current={
          active
            ? 'page'
            : undefined
        }
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl px-3 py-3 text-left disabled:cursor-not-allowed disabled:opacity-55">
        <span className={`grid size-9 shrink-0 place-items-center rounded-xl ${
          active
            ? 'bg-accent/12 text-accent'
            : 'bg-muted/55 text-muted-foreground'
        }`}>
          <Clock3 className="size-4" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-medium leading-5 text-foreground">
            {
              title
            }
          </span>

          <span className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">
              {
                deleting
                  ? 'Deleting…'
                  : stageLabel(
                      session
                    )
              }
            </span>

            {!deleting ? (
              <>
                <span aria-hidden="true">
                  ·
                </span>

                <span
                  className="truncate"
                  title={new Date(
                    session.updatedAt
                  ).toLocaleString(
                    'en-NG'
                  )}>
                  {
                    relativeTime(
                      session.updatedAt
                    )
                  }
                </span>
              </>
            ) : null}
          </span>
        </span>

        {active ? (
          <span className="size-2 shrink-0 rounded-full bg-accent" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-foreground" />
        )}
      </button>

      <button
        type="button"
        disabled={
          disabled
        }
        onClick={() =>
          onDelete(
            session.id,
            title
          )
        }
        className="mr-2 grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground opacity-60 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 focus:opacity-100 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label={`Delete ${title}`}
        title="Delete Journey">
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function JourneyNavigationRail({
  sessions,
  activeSessionId,
  loading,
  deletingJourneyId,
  clearingJourneyBucket,
  onSelect,
  onDelete,
  onClearAll,
  onStartNew,
  onClose
}: JourneyNavigationRailProps) {
  const [
    query,
    setQuery
  ] =
    useState(
      ''
    );

  const visibleSessions =
    useMemo(
      () => {
        const normalized =
          query
            .toLowerCase()
            .trim();

        const ordered =
          [...sessions].sort(
            (
              first,
              second
            ) =>
              Number(
                second.id ===
                activeSessionId
              ) -
                Number(
                  first.id ===
                  activeSessionId
                ) ||
              new Date(
                second.updatedAt
              ).getTime() -
                new Date(
                  first.updatedAt
                ).getTime()
          );

        if (!normalized) {
          return ordered;
        }

        return ordered.filter(
          session =>
            journeyTitle(
              session
            )
              .toLowerCase()
              .includes(
                normalized
              )
        );
      },
      [
        activeSessionId,
        query,
        sessions
      ]
    );

  const busy =
    loading ||
    clearingJourneyBucket ||
    Boolean(
      deletingJourneyId
    );

  return (
    <aside
      data-aj-sticky-journey-bucket="true"
      className="flex max-h-[70dvh] min-h-0 min-w-0 self-start flex-col overflow-hidden rounded-[1.6rem] border border-border/50 bg-card/70 p-3 shadow-sm backdrop-blur xl:sticky xl:top-24 xl:max-h-[calc(100svh-7rem)]">
      <div className="flex items-start justify-between gap-3 px-1">
        <div>
          <h2 className="text-sm font-medium text-foreground">
            Journeys
          </h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {
              sessions.length
            } saved
          </p>
        </div>

        <button
          type="button"
          onClick={
            onClose
          }
          className="grid size-9 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label="Close Journey navigation"
          title="Close Journeys">
          <PanelLeftClose className="size-4" />
        </button>
      </div>

      <button
        type="button"
        disabled={
          busy
        }
        onClick={
          onStartNew
        }
        className="mt-3 flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-4 text-xs font-medium text-primary-foreground shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50">
        <MessageSquarePlus className="size-4" />

        Start new Journey
      </button>

      {sessions.length >
      5 ? (
        <label className="mt-3 flex h-10 shrink-0 items-center gap-2 rounded-xl bg-muted/40 px-3 text-muted-foreground">
          <Search className="size-4 shrink-0" />

          <input
            value={
              query
            }
            onChange={event =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Find a Journey"
            className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      ) : null}

      <div className="mt-3 min-h-0 flex-1 overflow-y-auto overscroll-contain pr-1">
        {loading &&
        !sessions.length ? (
          <div className="grid h-32 place-items-center px-4 text-center text-xs leading-5 text-muted-foreground">
            Loading Journeys…
          </div>
        ) : visibleSessions.length ? (
          <div className="space-y-1">
            {visibleSessions.map(
              session => (
                <JourneyRow
                  key={
                    session.id
                  }
                  session={
                    session
                  }
                  active={
                    session.id ===
                    activeSessionId
                  }
                  deleting={
                    deletingJourneyId ===
                    session.id
                  }
                  disabled={
                    busy
                  }
                  onSelect={
                    onSelect
                  }
                  onDelete={
                    onDelete
                  }
                />
              )
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-muted/25 px-4 py-6 text-center">
            <p className="text-xs font-medium text-foreground">
              {
                sessions.length
                  ? 'No Journey matches that search.'
                  : 'No saved Journeys yet.'
              }
            </p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              Start with one real goal. AJ will keep the useful details together here.
            </p>
          </div>
        )}
      </div>

      {sessions.length ? (
        <div className="mt-2 shrink-0 border-t border-border/45 pt-2">
          <button
            type="button"
            disabled={
              busy
            }
            onClick={
              onClearAll
            }
            className="flex h-9 w-full items-center justify-center gap-2 rounded-full text-xs font-medium text-muted-foreground transition hover:bg-destructive/8 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-40">
            <Trash2 className="size-3.5" />

            {
              clearingJourneyBucket
                ? 'Clearing Journeys…'
                : 'Clear all Journeys'
            }
          </button>
        </div>
      ) : null}
    </aside>
  );
}

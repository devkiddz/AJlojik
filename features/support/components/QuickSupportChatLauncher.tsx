'use client';

import {
  BellRing,
  Headphones,
  MessagesSquare,
  X
} from 'lucide-react';

import {
  usePathname
} from 'next/navigation';

import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react';

import {
  useGlobalOverlay
} from '@/features/global-overlay';

import {
  cn
} from '@/lib/utils';

import {
  useQuickSupportAttentionStream
} from '../client/useQuickSupportAttentionStream';

import {
  useQuickSupportPanelState
} from '../client/useQuickSupportPanelState';

import {
  useQuickSupportSummary
} from '../client/useQuickSupportSummary';

import {
  QuickSupportChatWorkspace
} from './QuickSupportChatWorkspace';

const QUICK_SUPPORT_OVERLAY_ID =
  'quick-support-chat';

const hiddenPrefixes = [
  '/admin',
  '/vendor',
  '/support',
  '/sign-in',
  '/sign-up',
  '/adminlogin',
  '/offline',
  '/delivery-access'
] as const;

export function QuickSupportChatLauncher() {
  const pathname =
    usePathname();

  const {
    activeOverlay,
    closeOverlay,
    hasOpenOverlay,
    openOverlay
  } =
    useGlobalOverlay();

  const {
    summary,
    loading,
    refresh
  } =
    useQuickSupportSummary();

  const {
    workspaceId,
    mode,
    hydrated,
    markOpen,
    markMinimized
  } =
    useQuickSupportPanelState();

  const [
    showAttention,
    setShowAttention
  ] =
    useState(false);

  const previousUnreadRef =
    useRef<
      number |
      null
    >(
      null
    );

  const previousOverlayOpenRef =
    useRef(false);

  const restoredWorkspaceRef =
    useRef<
      string |
      null
    >(
      null
    );

  const hidden =
    hiddenPrefixes.some(
      prefix =>
        pathname ===
          prefix ||
        pathname.startsWith(
          `${prefix}/`
        )
    );

  const overlayOpen =
    activeOverlay?.id ===
    QUICK_SUPPORT_OVERLAY_ID;

  const hasActiveCase =
    Boolean(
      summary?.activeCase
    );

  const unreadCount =
    summary?.unreadCount ??
    0;

  const openSupport =
    useCallback(
      (): void => {
        markOpen();

        setShowAttention(
          false
        );

        openOverlay({
          id:
            QUICK_SUPPORT_OVERLAY_ID,
          eyebrow: (
            <span className="inline-flex items-center gap-2">
              <Headphones className="size-3.5" />
              AJ Logik Support
            </span>
          ),
          title:
            hasActiveCase
              ? 'Continue with Support'
              : 'Chat with Support',
          description:
            hasActiveCase
              ? 'Your current Support Case is ready and connected to the live workspace.'
              : 'Start a live Support conversation without leaving your current experience.',
          content: (
            <QuickSupportChatWorkspace />
          ),
          variant:
            'panel',
          size:
            'sm',
          closeLabel:
            'Minimize Support chat'
        });
      },
      [
        hasActiveCase,
        markOpen,
        openOverlay
      ]
    );

  useQuickSupportAttentionStream({
    workspaceId:
      summary?.workspaceId ??
      workspaceId,
    caseId:
      summary?.activeCase
        ?.id ??
      null,
    enabled:
      Boolean(
        summary
          ?.activeCase &&
        !overlayOpen &&
        !hidden
      ),
    onEvent:
      refresh
  });

  useEffect(
    () => {
      if (
        previousOverlayOpenRef.current &&
        !overlayOpen
      ) {
        markMinimized();
      }

      previousOverlayOpenRef.current =
        overlayOpen;
    },
    [
      markMinimized,
      overlayOpen
    ]
  );

  useEffect(
    () => {
      if (
        hidden &&
        overlayOpen
      ) {
        closeOverlay(
          QUICK_SUPPORT_OVERLAY_ID
        );

        markMinimized();
      }
    },
    [
      closeOverlay,
      hidden,
      markMinimized,
      overlayOpen
    ]
  );

  useEffect(
    () => {
      if (
        !hydrated ||
        !workspaceId ||
        !summary ||
        summary.workspaceId !==
          workspaceId
      ) {
        return;
      }

      if (
        mode ===
          'open' &&
        !summary.activeCase
      ) {
        markMinimized();

        restoredWorkspaceRef.current =
          workspaceId;

        return;
      }

      if (
        mode !==
          'open' ||
        hidden ||
        hasOpenOverlay ||
        !summary.activeCase ||
        restoredWorkspaceRef.current ===
          workspaceId
      ) {
        return;
      }

      restoredWorkspaceRef.current =
        workspaceId;

      const timer =
        window.setTimeout(
          openSupport,
          0
        );

      return () => {
        window.clearTimeout(
          timer
        );
      };
    },
    [
      hasOpenOverlay,
      hidden,
      hydrated,
      markMinimized,
      mode,
      openSupport,
      summary,
      workspaceId
    ]
  );

  useEffect(
    () => {
      const previous =
        previousUnreadRef.current;

      if (
        previous ===
        null
      ) {
        previousUnreadRef.current =
          unreadCount;

        if (
          unreadCount >
            0 &&
          !overlayOpen &&
          summary
            ?.latestAgentReply
        ) {
          setShowAttention(
            true
          );
        }

        return;
      }

      if (
        unreadCount >
          previous &&
        !overlayOpen
      ) {
        setShowAttention(
          true
        );
      }

      if (
        unreadCount ===
        0
      ) {
        setShowAttention(
          false
        );
      }

      previousUnreadRef.current =
        unreadCount;
    },
    [
      overlayOpen,
      summary
        ?.latestAgentReply,
      unreadCount
    ]
  );

  useEffect(
    () => {
      if (
        !showAttention
      ) {
        return;
      }

      const timer =
        window.setTimeout(
          () => {
            setShowAttention(
              false
            );
          },
          8_000
        );

      return () => {
        window.clearTimeout(
          timer
        );
      };
    },
    [
      showAttention
    ]
  );

  if (
    hidden ||
    hasOpenOverlay
  ) {
    return null;
  }

  const label =
    hasActiveCase
      ? 'Continue Support'
      : 'Support';

  const accessibleLabel =
    unreadCount >
      0
      ? `${unreadCount} unread Support ${unreadCount === 1 ? 'message' : 'messages'}. Open AJ Logik Support.`
      : hasActiveCase
        ? `Continue AJ Logik Support Case ${summary?.activeCase?.caseNumber ?? ''}`
        : 'Chat with AJ Logik Support';

  const badgeLabel =
    unreadCount >
      99
      ? '99+'
      : String(
          unreadCount
        );

  return (
    <>
      {showAttention &&
      summary?.latestAgentReply ? (
        <aside
          aria-live="polite"
          className="fixed bottom-[calc(env(safe-area-inset-bottom)+11.75rem)] right-[var(--app-page-gutter)] z-[179] w-[min(88vw,20rem)] rounded-[1.35rem] border border-emerald-500/25 bg-card/95 p-3 shadow-2xl backdrop-blur-xl md:bottom-[4.65rem] md:right-[calc(var(--app-page-gutter)+7.5rem)]">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-emerald-500/12 text-emerald-600">
              <BellRing className="size-4" />
            </span>

            <button
              type="button"
              onClick={
                openSupport
              }
              className="min-w-0 flex-1 text-left">
              <p className="text-[9px] font-black uppercase tracking-[0.15em] text-emerald-600">
                New Support reply
              </p>

              <p className="mt-1 truncate text-xs font-black">
                {
                  summary
                    .latestAgentReply
                    .sender
                    ?.name ??
                  'AJ Logik Support'
                }
              </p>

              <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted-foreground">
                {
                  summary
                    .latestAgentReply
                    .bodyPreview
                }
              </p>
            </button>

            <button
              type="button"
              aria-label="Dismiss Support reply preview"
              onClick={() =>
                setShowAttention(
                  false
                )
              }
              className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <X className="size-3.5" />
            </button>
          </div>
        </aside>
      ) : null}

      <button
        type="button"
        aria-label={
          accessibleLabel
        }
        title={
          accessibleLabel
        }
        data-support-workspace={
          summary?.workspaceId ??
          workspaceId ??
          undefined
        }
        data-support-panel-state={
          mode
        }
        data-support-unread={
          unreadCount
        }
        onClick={
          openSupport
        }
        className={cn(
          'group fixed bottom-[calc(env(safe-area-inset-bottom)+8.25rem)] right-[var(--app-page-gutter)] z-[180] inline-flex h-11 items-center gap-2 rounded-full border bg-background/95 px-3.5 text-xs font-black text-foreground shadow-[0_18px_50px_-18px_rgba(0,0,0,0.7)] ring-1 ring-background/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:bottom-5 md:right-[calc(var(--app-page-gutter)+7.5rem)] md:h-12 md:px-4',
          unreadCount >
            0
            ? 'border-emerald-500/60 shadow-[0_18px_55px_-15px_rgba(16,185,129,0.55)]'
            : 'border-emerald-500/30 hover:border-emerald-500/50'
        )}>
        <span className="relative grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
          <MessagesSquare className="size-4.5" />

          {unreadCount >
          0 ? (
            <span
              aria-hidden="true"
              className="absolute -right-2.5 -top-2.5 grid min-h-5 min-w-5 place-items-center rounded-full border-2 border-background bg-emerald-500 px-1 text-[8px] font-black leading-none text-white shadow-lg">
              {
                badgeLabel
              }
            </span>
          ) : (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-background bg-emerald-500"
            />
          )}
        </span>

        <span>
          {
            loading
              ? 'Support'
              : label
          }
        </span>
      </button>
    </>
  );
}

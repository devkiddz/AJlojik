'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from 'react';

import { usePathname, useRouter } from 'next/navigation';

import { useIdentity } from '@/providers/IdentityProvider';

import type { ExperienceTarget, FeedActions, FeedContext, FeedExperience, FeedIntent } from '../contracts';

import { feedExperienceEngine } from '../engine';

// ============================================================
// CONTEXT CONTRACT
// ============================================================

type FeedExperienceContextValue = {
  intent: FeedIntent;
  context: FeedContext;
  experience: FeedExperience;
  actions: FeedActions;

  /**
   * True while the next experience is being committed.
   *
   * The renderer uses this to display the central
   * Experience Feed loader without disturbing the
   * Navigation Rail or Discovery Hub.
   */
  isResolving: boolean;

  /**
   * Describes the incoming experience while the current
   * experience is still mounted.
   *
   * This allows the loader to distinguish between:
   * product, collection, promotion, search, etc.
   */
  pendingIntent: FeedIntent | null;
};

const FeedExperienceContext = createContext<FeedExperienceContextValue | null>(null);

// ============================================================
// PROVIDER PROPS
// ============================================================

type FeedExperienceProviderProps = {
  children: ReactNode;

  initialIntent: FeedIntent;

  context: FeedContext;

  baseActions: Omit<FeedActions, 'openExperience' | 'restoreExperience' | 'resetExperience'>;
};

// ============================================================
// AUTHENTICATION
// ============================================================

const EXPERIENCE_AUTH_ROUTE = '/sign-in';

function targetRequiresAccount(target: ExperienceTarget): boolean {
  switch (target.type) {
    case 'product':
    case 'collection':
    case 'promotion':
    case 'search':
      return true;

    default:
      return false;
  }
}

function intentRequiresAccount(intent: FeedIntent): boolean {
  switch (intent.type) {
    case 'product':
    case 'collection':
    case 'promotion':
    case 'search':
      return true;

    default:
      return false;
  }
}

// ============================================================
// INTENT FACTORY
// ============================================================

function createIntent(target: ExperienceTarget): FeedIntent {
  const createdAt = new Date().toISOString();

  const nonce = `${Date.now()}-${crypto.randomUUID()}`;

  switch (target.type) {
    case 'home':
      return {
        id: `home:${nonce}`,
        type: 'home',
        source: 'user-action',
        createdAt
      };

    case 'store-discovery':
      return {
        id: `store-discovery:${target.categorySlug ?? 'all'}:${nonce}`,

        type: 'store-discovery',

        source: 'user-action',

        categorySlug: target.categorySlug ?? 'all',

        createdAt
      };

    case 'category':
      return {
        id: `category:${target.categorySlug}:${nonce}`,

        type: 'category',

        source: 'user-action',

        categorySlug: target.categorySlug,

        createdAt
      };

    case 'product':
      return {
        id: `product:${target.productId}:${nonce}`,

        type: 'product',

        source: 'hub-card',

        targetId: target.productId,

        createdAt
      };

    case 'collection':
      return {
        id: `collection:${target.collectionId}:${nonce}`,

        type: 'collection',

        source: 'user-action',

        targetId: target.collectionId,

        createdAt
      };

    case 'promotion':
      return {
        id: `promotion:${target.promotionId}:${nonce}`,

        type: 'promotion',

        source: 'user-action',

        targetId: target.promotionId,

        createdAt
      };

    case 'search':
      return {
        id: `search:${target.query}:${nonce}`,

        type: 'search',

        source: 'search',

        query: target.query,

        createdAt
      };
  }
}

// ============================================================
// PROVIDER
// ============================================================

export function FeedExperienceProvider({
  children,
  initialIntent,
  context,
  baseActions
}: FeedExperienceProviderProps) {
  const router = useRouter();

  const pathname = usePathname();

  const { isAuthenticated, isPending } = useIdentity();

  const [intent, setIntent] = useState<FeedIntent>(initialIntent);

  const [pendingIntent, setPendingIntent] = useState<FeedIntent | null>(null);

  /**
   * First frame:
   * show the loader.
   *
   * Second frame:
   * commit the next intent.
   */
  const resolutionFrameRef = useRef<number | null>(null);

  /**
   * Final frame:
   * remove the loader after the engine has produced
   * the new experience.
   */
  const completionFrameRef = useRef<number | null>(null);

  const cancelResolutionFrames = useCallback(() => {
    if (resolutionFrameRef.current !== null) {
      window.cancelAnimationFrame(resolutionFrameRef.current);

      resolutionFrameRef.current = null;
    }

    if (completionFrameRef.current !== null) {
      window.cancelAnimationFrame(completionFrameRef.current);

      completionFrameRef.current = null;
    }
  }, []);

  const requestAuthentication = useCallback(() => {
    const returnTo = encodeURIComponent(pathname || '/');

    router.push(`${EXPERIENCE_AUTH_ROUTE}?returnTo=${returnTo}`);
  }, [pathname, router]);

  /**
   * Queues an intent instead of replacing the current
   * experience immediately.
   *
   * This gives React one browser frame to paint the
   * Experience Feed loader.
   */
  const beginResolution = useCallback(
    (nextIntent: FeedIntent) => {
      cancelResolutionFrames();

      /**
       * Resetting to the already active intent should
       * cancel any queued transition instead of creating
       * a permanent loading state.
       */
      if (nextIntent.id === intent.id) {
        setPendingIntent(null);
        return;
      }

      setPendingIntent(nextIntent);

      resolutionFrameRef.current = window.requestAnimationFrame(() => {
        resolutionFrameRef.current = null;

        setIntent(nextIntent);
      });
    },
    [cancelResolutionFrames, intent.id]
  );

  // ==========================================================
  // EXPERIENCE ACTIONS
  // ==========================================================

  const openExperience = useCallback(
    (target: ExperienceTarget) => {
      if (targetRequiresAccount(target)) {
        /**
         * Better Auth is still checking the session.
         * Do not incorrectly classify the user as a guest.
         */
        if (isPending) {
          return;
        }

        if (!isAuthenticated) {
          requestAuthentication();
          return;
        }
      }

      beginResolution(createIntent(target));
    },
    [beginResolution, isAuthenticated, isPending, requestAuthentication]
  );

  const restoreExperience = useCallback(
    (restoredIntent: FeedIntent) => {
      if (intentRequiresAccount(restoredIntent)) {
        if (isPending) {
          return;
        }

        if (!isAuthenticated) {
          requestAuthentication();
          return;
        }
      }

      beginResolution(restoredIntent);
    },
    [beginResolution, isAuthenticated, isPending, requestAuthentication]
  );

  const resetExperience = useCallback(() => {
    beginResolution(initialIntent);
  }, [beginResolution, initialIntent]);

  const actions = useMemo<FeedActions>(
    () => ({
      ...baseActions,

      openExperience,
      restoreExperience,
      resetExperience
    }),
    [baseActions, openExperience, restoreExperience, resetExperience]
  );

  // ==========================================================
  // EXPERIENCE RESOLUTION
  // ==========================================================

  const experience = useMemo(
    () =>
      feedExperienceEngine.resolve({
        intent,
        context
      }),
    [intent, context]
  );

  /**
   * The engine is synchronous today, but the completion
   * frame ensures the loader is painted before it disappears.
   *
   * This also prepares the Provider for asynchronous
   * experience resolvers later.
   */
  useEffect(() => {
    if (!pendingIntent) {
      return;
    }

    if (pendingIntent.id !== intent.id) {
      return;
    }

    completionFrameRef.current = window.requestAnimationFrame(() => {
      completionFrameRef.current = null;

      setPendingIntent(currentPendingIntent =>
        currentPendingIntent?.id === intent.id ? null : currentPendingIntent
      );
    });

    return () => {
      if (completionFrameRef.current !== null) {
        window.cancelAnimationFrame(completionFrameRef.current);

        completionFrameRef.current = null;
      }
    };
  }, [experience.id, intent.id, pendingIntent]);

  /**
   * Cancel pending browser frames when this provider
   * leaves the workspace.
   */
  useEffect(() => cancelResolutionFrames, [cancelResolutionFrames]);

  const isResolving = pendingIntent !== null;

  const value = useMemo<FeedExperienceContextValue>(
    () => ({
      intent,
      context,
      experience,
      actions,

      isResolving,
      pendingIntent
    }),
    [intent, context, experience, actions, isResolving, pendingIntent]
  );

  return <FeedExperienceContext.Provider value={value}>{children}</FeedExperienceContext.Provider>;
}

// ============================================================
// CONSUMER HOOK
// ============================================================

export function useFeedExperienceContext() {
  const value = useContext(FeedExperienceContext);

  if (!value) {
    throw new Error('useFeedExperienceContext must be used inside FeedExperienceProvider.');
  }

  return value;
}

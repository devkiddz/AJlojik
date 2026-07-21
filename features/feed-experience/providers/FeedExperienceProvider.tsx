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

import type { ExperienceTarget, FeedActions, FeedContext, FeedExperience, FeedIntent } from '../contracts';

import { feedExperienceEngine } from '../engine';

const MIN_RESOLUTION_DURATION_MS = 320;

// ============================================================
// PRODUCT DETAILS DISCLOSURE
// ============================================================

export type ProductDetailsDisclosure = {
  productId: string | null;
  expanded: boolean;
  requestId: number;
};

// ============================================================
// CONTEXT CONTRACT
// ============================================================

type FeedExperienceContextValue = {
  intent: FeedIntent;

  context: FeedContext;

  experience: FeedExperience;

  actions: FeedActions;

  isResolving: boolean;

  pendingIntent: FeedIntent | null;

  /**
   * Presentation state for progressively revealing the
   * complete Product Experience inside the central Feed.
   *
   * The Product Experience remains one intent. Revealing
   * details does not create another page, modal or intent.
   */
  productDetailsDisclosure: ProductDetailsDisclosure;
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
        source: 'user-action',
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
  const [intent, setIntent] = useState<FeedIntent>(initialIntent);

  const [pendingIntent, setPendingIntent] = useState<FeedIntent | null>(null);

  const [productDetailsDisclosure, setProductDetailsDisclosure] = useState<ProductDetailsDisclosure>({
    productId: initialIntent.type === 'product' ? (initialIntent.targetId ?? null) : null,

    expanded: false,

    requestId: 0
  });

  const lastInitialIntentIdRef = useRef(initialIntent.id);

  const resolutionFrameRef = useRef<number | null>(null);

  const completionTimerRef = useRef<number | null>(null);

  const resolutionStartedAtRef = useRef(0);

  const cancelResolutionWork = useCallback(() => {
    if (resolutionFrameRef.current !== null) {
      window.cancelAnimationFrame(resolutionFrameRef.current);

      resolutionFrameRef.current = null;
    }

    if (completionTimerRef.current !== null) {
      window.clearTimeout(completionTimerRef.current);

      completionTimerRef.current = null;
    }
  }, []);

  const beginResolution = useCallback(
    (nextIntent: FeedIntent) => {
      cancelResolutionWork();

      if (nextIntent.id === intent.id) {
        setPendingIntent(null);

        return;
      }

      resolutionStartedAtRef.current = window.performance.now();

      setPendingIntent(nextIntent);

      resolutionFrameRef.current = window.requestAnimationFrame(() => {
        resolutionFrameRef.current = null;

        setIntent(nextIntent);
      });
    },
    [cancelResolutionWork, intent.id]
  );

  // ==========================================================
  // ROUTE INTENT SYNCHRONISATION
  // ==========================================================

  useEffect(() => {
    if (lastInitialIntentIdRef.current === initialIntent.id) {
      return;
    }

    lastInitialIntentIdRef.current = initialIntent.id;

    beginResolution(initialIntent);
  }, [beginResolution, initialIntent]);

  /**
   * Every committed Product Experience begins in overview mode.
   *
   * Revealing details is presentation state inside that same
   * experience. A different intent resets the disclosure.
   */
  useEffect(() => {
    const activeProductId = intent.type === 'product' ? (intent.targetId ?? null) : null;

    setProductDetailsDisclosure(currentDisclosure => ({
      productId: activeProductId,

      expanded: false,

      requestId: currentDisclosure.requestId
    }));
  }, [intent.id, intent.targetId, intent.type]);

  // ==========================================================
  // EXPERIENCE ACTIONS
  // ==========================================================

  const openExperience = useCallback(
    (target: ExperienceTarget) => {
      beginResolution(createIntent(target));
    },
    [beginResolution]
  );

  const restoreExperience = useCallback(
    (restoredIntent: FeedIntent) => {
      beginResolution(restoredIntent);
    },
    [beginResolution]
  );

  const resetExperience = useCallback(() => {
    beginResolution(initialIntent);
  }, [beginResolution, initialIntent]);

  const revealProductDetails = useCallback((productId: string) => {
    setProductDetailsDisclosure(currentDisclosure => ({
      productId,

      expanded: true,

      requestId: currentDisclosure.requestId + 1
    }));
  }, []);

  /**
   * The same product action has two contextual meanings:
   *
   * Outside Product Experience:
   *   open the Product Experience.
   *
   * Inside that exact Product Experience:
   *   reveal or refocus its complete details in the Feed.
   */
  const previewProduct = useCallback<FeedActions['previewProduct']>(
    product => {
      const isActiveProduct = intent.type === 'product' && intent.targetId === product.id;

      if (isActiveProduct) {
        revealProductDetails(product.id);

        return;
      }

      openExperience({
        type: 'product',

        productId: product.id
      });
    },
    [intent.targetId, intent.type, openExperience, revealProductDetails]
  );

  const actions = useMemo<FeedActions>(
    () => ({
      ...baseActions,

      previewProduct,

      openExperience,

      restoreExperience,

      resetExperience
    }),
    [baseActions, previewProduct, openExperience, restoreExperience, resetExperience]
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

  useEffect(() => {
    if (!pendingIntent) {
      return;
    }

    if (pendingIntent.id !== intent.id) {
      return;
    }

    const elapsed = window.performance.now() - resolutionStartedAtRef.current;

    const remaining = Math.max(
      0,

      MIN_RESOLUTION_DURATION_MS - elapsed
    );

    completionTimerRef.current = window.setTimeout(() => {
      completionTimerRef.current = null;

      setPendingIntent(currentPendingIntent =>
        currentPendingIntent?.id === intent.id ? null : currentPendingIntent
      );
    }, remaining);

    return () => {
      if (completionTimerRef.current !== null) {
        window.clearTimeout(completionTimerRef.current);

        completionTimerRef.current = null;
      }
    };
  }, [experience.id, intent.id, pendingIntent]);

  useEffect(
    () => () => {
      cancelResolutionWork();
    },
    [cancelResolutionWork]
  );

  const isResolving = pendingIntent !== null;

  const value = useMemo<FeedExperienceContextValue>(
    () => ({
      intent,

      context,

      experience,

      actions,

      isResolving,

      pendingIntent,

      productDetailsDisclosure
    }),
    [intent, context, experience, actions, isResolving, pendingIntent, productDetailsDisclosure]
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

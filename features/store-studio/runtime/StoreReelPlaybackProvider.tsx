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

import {
  MEDIA_EXPERIENCE_STATE_EVENT,
  type MediaExperienceStateDetail
} from '@/lib/mediaExperienceEvents';

const AUTOPLAY_VISIBILITY_THRESHOLD = 0.65;
const MANUAL_PLAYBACK_VISIBILITY_THRESHOLD = 0.35;
const RESET_PAUSE_VISIBILITY_THRESHOLD = 0.2;

export type StoreReelRegistration = {
  autoplay: boolean;
  order: number;
};

type StoreReelPlaybackContextValue = {
  activeReelId: string | null;
  muted: boolean;
  reducedMotion: boolean;
  registerReel: (
    reelId: string,
    registration: StoreReelRegistration
  ) => () => void;
  reportVisibility: (
    reelId: string,
    intersectionRatio: number
  ) => void;
  togglePlayback: (reelId: string) => void;
  pauseReel: (reelId: string) => void;
  toggleMuted: () => void;
};

type StoreReelPlaybackProviderProps = {
  children: ReactNode;
};

const StoreReelPlaybackContext =
  createContext<StoreReelPlaybackContextValue | null>(
    null
  );

export function StoreReelPlaybackProvider({
  children
}: StoreReelPlaybackProviderProps) {
  const [activeReelId, setActiveReelIdState] =
    useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const [reducedMotion, setReducedMotion] =
    useState(false);

  const activeReelIdRef = useRef<string | null>(null);
  const reducedMotionRef = useRef(false);
  const pageVisibleRef = useRef(true);
  const runtimeReadyRef = useRef(false);
  const openMediaOwnersRef = useRef(new Set<string>());
  const registrationsRef = useRef(
    new Map<string, StoreReelRegistration>()
  );
  const visibilityRatiosRef = useRef(
    new Map<string, number>()
  );
  const manuallyPausedReelIdsRef = useRef(
    new Set<string>()
  );
  const manuallyActivatedReelIdRef =
    useRef<string | null>(null);

  const setActiveReelId = useCallback(
    (reelId: string | null) => {
      activeReelIdRef.current = reelId;
      setActiveReelIdState(reelId);
    },
    []
  );

  const resolveAutoplayCandidate = useCallback(
    (): string | null => {
      if (
        !pageVisibleRef.current ||
        openMediaOwnersRef.current.size > 0
      ) {
        return null;
      }

      const manuallyActivatedReelId =
        manuallyActivatedReelIdRef.current;

      if (manuallyActivatedReelId) {
        const manualVisibility =
          visibilityRatiosRef.current.get(
            manuallyActivatedReelId
          ) ?? 0;

        if (
          registrationsRef.current.has(
            manuallyActivatedReelId
          ) &&
          manualVisibility >=
            MANUAL_PLAYBACK_VISIBILITY_THRESHOLD
        ) {
          return manuallyActivatedReelId;
        }

        manuallyActivatedReelIdRef.current = null;
      }

      if (
        !runtimeReadyRef.current ||
        reducedMotionRef.current
      ) {
        return null;
      }

      let bestCandidate: {
        reelId: string;
        visibilityRatio: number;
        order: number;
      } | null = null;

      for (const [reelId, registration] of
        registrationsRef.current.entries()) {
        const visibilityRatio =
          visibilityRatiosRef.current.get(reelId) ?? 0;

        if (
          !registration.autoplay ||
          visibilityRatio <
            AUTOPLAY_VISIBILITY_THRESHOLD ||
          manuallyPausedReelIdsRef.current.has(reelId)
        ) {
          continue;
        }

        if (
          !bestCandidate ||
          visibilityRatio >
            bestCandidate.visibilityRatio ||
          (visibilityRatio ===
            bestCandidate.visibilityRatio &&
            registration.order < bestCandidate.order)
        ) {
          bestCandidate = {
            reelId,
            visibilityRatio,
            order: registration.order
          };
        }
      }

      return bestCandidate?.reelId ?? null;
    },
    []
  );

  const reconcilePlayback = useCallback(() => {
    const nextReelId = resolveAutoplayCandidate();

    if (activeReelIdRef.current !== nextReelId) {
      setActiveReelId(nextReelId);
    }
  }, [resolveAutoplayCandidate, setActiveReelId]);

  const registerReel = useCallback(
    (
      reelId: string,
      registration: StoreReelRegistration
    ) => {
      registrationsRef.current.set(
        reelId,
        registration
      );

      return () => {
        registrationsRef.current.delete(reelId);
        visibilityRatiosRef.current.delete(reelId);
        manuallyPausedReelIdsRef.current.delete(reelId);

        if (
          manuallyActivatedReelIdRef.current === reelId
        ) {
          manuallyActivatedReelIdRef.current = null;
        }

        if (activeReelIdRef.current === reelId) {
          setActiveReelId(null);
        }
      };
    },
    [setActiveReelId]
  );

  const reportVisibility = useCallback(
    (reelId: string, intersectionRatio: number) => {
      if (!registrationsRef.current.has(reelId)) {
        return;
      }

      visibilityRatiosRef.current.set(
        reelId,
        intersectionRatio
      );

      if (
        intersectionRatio <
        RESET_PAUSE_VISIBILITY_THRESHOLD
      ) {
        manuallyPausedReelIdsRef.current.delete(reelId);
      }

      if (
        manuallyActivatedReelIdRef.current === reelId &&
        intersectionRatio <
          MANUAL_PLAYBACK_VISIBILITY_THRESHOLD
      ) {
        manuallyActivatedReelIdRef.current = null;
      }

      reconcilePlayback();
    },
    [reconcilePlayback]
  );

  const togglePlayback = useCallback(
    (reelId: string) => {
      if (activeReelIdRef.current === reelId) {
        manuallyPausedReelIdsRef.current.add(reelId);
        manuallyActivatedReelIdRef.current = null;
        setActiveReelId(null);
        return;
      }

      manuallyPausedReelIdsRef.current.delete(reelId);
      manuallyActivatedReelIdRef.current = reelId;
      setActiveReelId(reelId);
    },
    [setActiveReelId]
  );

  const pauseReel = useCallback(
    (reelId: string) => {
      manuallyPausedReelIdsRef.current.add(reelId);

      if (
        manuallyActivatedReelIdRef.current === reelId
      ) {
        manuallyActivatedReelIdRef.current = null;
      }

      if (activeReelIdRef.current === reelId) {
        setActiveReelId(null);
      }
    },
    [setActiveReelId]
  );

  const toggleMuted = useCallback(() => {
    setMuted(currentMuted => !currentMuted);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );

    const updateReducedMotion = () => {
      runtimeReadyRef.current = true;
      reducedMotionRef.current = mediaQuery.matches;
      setReducedMotion(mediaQuery.matches);

      if (mediaQuery.matches) {
        setActiveReelId(null);
        return;
      }

      reconcilePlayback();
    };

    updateReducedMotion();
    mediaQuery.addEventListener(
      'change',
      updateReducedMotion
    );

    return () => {
      mediaQuery.removeEventListener(
        'change',
        updateReducedMotion
      );
    };
  }, [reconcilePlayback, setActiveReelId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      pageVisibleRef.current =
        document.visibilityState === 'visible';

      if (!pageVisibleRef.current) {
        setActiveReelId(null);
        return;
      }

      reconcilePlayback();
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, [reconcilePlayback, setActiveReelId]);

  useEffect(() => {
    const handleMediaExperienceState = (
      event: Event
    ) => {
      const mediaEvent = event as CustomEvent<
        MediaExperienceStateDetail
      >;
      const detail = mediaEvent.detail;

      if (!detail?.ownerId) {
        return;
      }

      if (detail.open) {
        openMediaOwnersRef.current.add(detail.ownerId);
        setActiveReelId(null);
        return;
      }

      openMediaOwnersRef.current.delete(detail.ownerId);
      reconcilePlayback();
    };

    window.addEventListener(
      MEDIA_EXPERIENCE_STATE_EVENT,
      handleMediaExperienceState
    );

    return () => {
      window.removeEventListener(
        MEDIA_EXPERIENCE_STATE_EVENT,
        handleMediaExperienceState
      );
    };
  }, [reconcilePlayback, setActiveReelId]);

  const value = useMemo<StoreReelPlaybackContextValue>(
    () => ({
      activeReelId,
      muted,
      reducedMotion,
      registerReel,
      reportVisibility,
      togglePlayback,
      pauseReel,
      toggleMuted
    }),
    [
      activeReelId,
      muted,
      reducedMotion,
      registerReel,
      reportVisibility,
      togglePlayback,
      pauseReel,
      toggleMuted
    ]
  );

  return (
    <StoreReelPlaybackContext.Provider value={value}>
      {children}
    </StoreReelPlaybackContext.Provider>
  );
}

export function useStoreReelPlayback():
  StoreReelPlaybackContextValue {
  const context = useContext(StoreReelPlaybackContext);

  if (!context) {
    throw new Error(
      'useStoreReelPlayback must be used inside StoreReelPlaybackProvider.'
    );
  }

  return context;
}

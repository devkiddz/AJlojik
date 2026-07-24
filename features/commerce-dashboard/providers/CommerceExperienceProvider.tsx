'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

import type {
  CommerceAssistantAction,
  ResolvedCommerceDashboard
} from '../contracts/commerceDashboardTypes';

type CommerceExperienceContextValue = {
  experience: ResolvedCommerceDashboard;

  assistantOpen: boolean;
  activeAssistantAction: CommerceAssistantAction | null;

  openAssistant: (
    action?: CommerceAssistantAction
  ) => void;

  closeAssistant: () => void;

  selectAssistantAction: (
    action: CommerceAssistantAction
  ) => void;
};

type CommerceExperienceProviderProps = {
  initialExperience: ResolvedCommerceDashboard;
  children: ReactNode;
};

const CommerceExperienceContext =
  createContext<CommerceExperienceContextValue | null>(
    null
  );

export function CommerceExperienceProvider({
  initialExperience,
  children
}: CommerceExperienceProviderProps) {
  const [assistantOpen, setAssistantOpen] =
    useState(false);

  const [
    activeAssistantAction,
    setActiveAssistantAction
  ] =
    useState<CommerceAssistantAction | null>(
      null
    );

  const openAssistant = useCallback(
    (
      action?: CommerceAssistantAction
    ) => {
      if (action) {
        setActiveAssistantAction(action);
      }

      setAssistantOpen(true);
    },
    []
  );

  const closeAssistant =
    useCallback(() => {
      setAssistantOpen(false);
    }, []);

  const selectAssistantAction =
    useCallback(
      (
        action: CommerceAssistantAction
      ) => {
        setActiveAssistantAction(action);
        setAssistantOpen(true);

        window.dispatchEvent(
          new CustomEvent(
            'rcentz:ai-assistant-requested',
            {
              detail: {
                prompt: action.prompt,
                action,
                context:
                  initialExperience.assistant
              }
            }
          )
        );
      },
      [initialExperience.assistant]
    );

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(
        'rcentz:commerce-experience-resolved',
        {
          detail: {
            dashboard: {
              priority:
                initialExperience.priority,
              pulse:
                initialExperience.pulse,
              journeys:
                initialExperience.journeys,
              mixes:
                initialExperience.mixes
            },

            hub: initialExperience.hub,

            assistant:
              initialExperience.assistant
          }
        }
      )
    );
  }, [initialExperience]);

  useEffect(() => {
    const handleOpenAssistant = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          action?: CommerceAssistantAction;
        }>;

      openAssistant(
        customEvent.detail?.action
      );
    };

    window.addEventListener(
      'rcentz:open-ai-companion',
      handleOpenAssistant
    );

    return () => {
      window.removeEventListener(
        'rcentz:open-ai-companion',
        handleOpenAssistant
      );
    };
  }, [openAssistant]);

  const value =
    useMemo<CommerceExperienceContextValue>(
      () => ({
        experience:
          initialExperience,

        assistantOpen,
        activeAssistantAction,

        openAssistant,
        closeAssistant,

        selectAssistantAction
      }),
      [
        initialExperience,
        assistantOpen,
        activeAssistantAction,
        openAssistant,
        closeAssistant,
        selectAssistantAction
      ]
    );

  return (
    <CommerceExperienceContext.Provider
      value={value}>
      {children}
    </CommerceExperienceContext.Provider>
  );
}

export function useCommerceExperience() {
  const context = useContext(
    CommerceExperienceContext
  );

  if (!context) {
    throw new Error(
      'useCommerceExperience must be used within CommerceExperienceProvider.'
    );
  }

  return context;
}

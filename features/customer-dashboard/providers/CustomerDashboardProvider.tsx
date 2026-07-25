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
  ResolvedCustomerDashboard
} from '../contracts/customerDashboardTypes';

type CustomerDashboardContextValue = {
  dashboard: ResolvedCustomerDashboard;

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

type CustomerDashboardProviderProps = {
  initialDashboard: ResolvedCustomerDashboard;
  children: ReactNode;
};

const CustomerDashboardContext =
  createContext<CustomerDashboardContextValue | null>(
    null
  );

export function CustomerDashboardProvider({
  initialDashboard,
  children
}: CustomerDashboardProviderProps) {
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
                  initialDashboard.assistant
              }
            }
          )
        );
      },
      [initialDashboard.assistant]
    );

  useEffect(() => {
    const detail = {
      dashboard: {
        priority:
          initialDashboard.priority,
        pulse:
          initialDashboard.pulse,
        actions:
          initialDashboard.actions,
        summary:
          initialDashboard.summary,
        quickActions:
          initialDashboard.quickActions,
        activity:
          initialDashboard.activity,
        journeys:
          initialDashboard.journeys,
        mixes:
          initialDashboard.mixes
      },

      hub: initialDashboard.hub,

      assistant:
        initialDashboard.assistant
    };

    window.dispatchEvent(
      new CustomEvent(
        'rcentz:customer-dashboard-resolved',
        { detail }
      )
    );

    // Temporary V1 compatibility for existing Hub listeners.
    window.dispatchEvent(
      new CustomEvent(
        'rcentz:commerce-experience-resolved',
        { detail }
      )
    );
  }, [initialDashboard]);

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
    useMemo<CustomerDashboardContextValue>(
      () => ({
        dashboard:
          initialDashboard,

        assistantOpen,
        activeAssistantAction,

        openAssistant,
        closeAssistant,

        selectAssistantAction
      }),
      [
        initialDashboard,
        assistantOpen,
        activeAssistantAction,
        openAssistant,
        closeAssistant,
        selectAssistantAction
      ]
    );

  return (
    <CustomerDashboardContext.Provider
      value={value}>
      {children}
    </CustomerDashboardContext.Provider>
  );
}

export function useCustomerDashboard() {
  const context = useContext(
    CustomerDashboardContext
  );

  if (!context) {
    throw new Error(
      'useCustomerDashboard must be used within CustomerDashboardProvider.'
    );
  }

  return context;
}

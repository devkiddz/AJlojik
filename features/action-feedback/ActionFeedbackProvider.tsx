'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useRouter } from 'next/navigation';

import { useIdentity } from '@/providers/IdentityProvider';

import { ActionFeedbackContext } from './actionFeedbackContext';

import { ActionFeedbackViewport } from './ActionFeedbackViewport';

import { AuthenticationGateDialog } from './AuthenticationGateDialog';

import { StoreExperienceOnboarding } from './StoreExperienceOnboarding';

import { readPendingAction, writePendingAction } from './actionFeedbackStorage';

import { buildAuthHref, getCurrentReturnTo, sanitizeInternalReturnTo } from './authNavigation';

import type {
  ActionFeedbackContextValue,
  ActionFeedbackInput,
  ActionFeedbackMessage,
  ActionFeedbackTone,
  AuthenticationGateRequest,
  CreateProtectedActionInput,
  ProtectedActionDescriptor,
  ProtectedActionHandler,
  RunProtectedActionInput
} from './actionFeedbackTypes';

type ActionFeedbackProviderProps = {
  children: ReactNode;
};

const defaultDurations = {
  success: 3500,
  error: 6000,
  warning: 5000,
  info: 4500
} satisfies Record<ActionFeedbackTone, number>;

function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}:${crypto.randomUUID()}`;
  }

  return `${prefix}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

function createProtectedAction(input: CreateProtectedActionInput): ProtectedActionDescriptor {
  return {
    id: input.id ?? createId('action'),
    type: input.type,
    payload: input.payload,
    title: input.title,
    description: input.description,
    successTitle: input.successTitle,
    successDescription: input.successDescription,
    returnTo: sanitizeInternalReturnTo(input.returnTo ?? getCurrentReturnTo(), '/store'),
    createdAt: Date.now()
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export function ActionFeedbackProvider({ children }: ActionFeedbackProviderProps) {
  const router = useRouter();

  const { isAuthenticated, isPending } = useIdentity();

  const [messages, setMessages] = useState<ActionFeedbackMessage[]>([]);

  const [authenticationRequest, setAuthenticationRequest] = useState<AuthenticationGateRequest | null>(null);

  const [pendingAction, setPendingAction] = useState<ProtectedActionDescriptor | null>(null);

  const [resumingAction, setResumingAction] = useState(false);

  const [handlerVersion, setHandlerVersion] = useState(0);

  const dismissalTimers = useRef(new Map<string, number>());

  const protectedActionHandlers = useRef(new Map<string, ProtectedActionHandler>());

  const dismiss = useCallback((messageId: string) => {
    const timer = dismissalTimers.current.get(messageId);

    if (timer) {
      window.clearTimeout(timer);
      dismissalTimers.current.delete(messageId);
    }

    setMessages(currentMessages => currentMessages.filter(message => message.id !== messageId));
  }, []);

  const dismissAll = useCallback(() => {
    dismissalTimers.current.forEach(timer => {
      window.clearTimeout(timer);
    });

    dismissalTimers.current.clear();
    setMessages([]);
  }, []);

  const notify = useCallback(
    (input: ActionFeedbackInput): string => {
      const tone = input.tone ?? 'info';

      const duration = input.duration ?? defaultDurations[tone];

      const message: ActionFeedbackMessage = {
        id: createId('feedback'),

        tone,

        title: input.title,
        description: input.description,

        duration,
        createdAt: Date.now(),

        banner: input.banner,
        action: input.action
      };

      setMessages(currentMessages => [...currentMessages.slice(-3), message]);

      if (duration > 0) {
        const timer = window.setTimeout(() => {
          dismiss(message.id);
        }, duration);

        dismissalTimers.current.set(message.id, timer);
      }

      return message.id;
    },
    [dismiss]
  );

  const success = useCallback(
    (input: Omit<ActionFeedbackInput, 'tone'>) =>
      notify({
        ...input,
        tone: 'success'
      }),
    [notify]
  );

  const error = useCallback(
    (input: Omit<ActionFeedbackInput, 'tone'>) =>
      notify({
        ...input,
        tone: 'error'
      }),
    [notify]
  );

  const warning = useCallback(
    (input: Omit<ActionFeedbackInput, 'tone'>) =>
      notify({
        ...input,
        tone: 'warning'
      }),
    [notify]
  );

  const info = useCallback(
    (input: Omit<ActionFeedbackInput, 'tone'>) =>
      notify({
        ...input,
        tone: 'info'
      }),
    [notify]
  );

  const clearPendingAction = useCallback(() => {
    setPendingAction(null);
    writePendingAction(null);
  }, []);

  const preservePendingAction = useCallback((action: ProtectedActionDescriptor) => {
    setPendingAction(action);
    writePendingAction(action);
  }, []);

  const executeAction = useCallback(
    async (action: ProtectedActionDescriptor, handler: ProtectedActionHandler): Promise<boolean> => {
      try {
        await handler(action.payload, action);

        success({
          title: action.successTitle ?? 'Action completed',

          description: action.successDescription ?? 'Your AJ Logik experience has been updated.'
        });

        return true;
      } catch (actionError) {
        error({
          title: 'Unable to complete action',
          description: getErrorMessage(
            actionError,
            'AJ Logik could not complete that action. Please try again.'
          )
        });

        return false;
      }
    },
    [error, success]
  );

  const runProtectedAction = useCallback(
    async ({ action: actionInput, execute, gate }: RunProtectedActionInput): Promise<boolean> => {
      if (isPending) {
        info({
          title: 'Checking your account',
          description: 'Please wait a moment while AJ Logik confirms your session.'
        });

        return false;
      }

      const action = createProtectedAction(actionInput);

      if (!isAuthenticated) {
        preservePendingAction(action);

        setAuthenticationRequest({
          action,
          copy: gate
        });

        return false;
      }

      return executeAction(action, execute);
    },
    [executeAction, info, isAuthenticated, isPending, preservePendingAction]
  );

  const registerProtectedActionHandler = useCallback(
    (actionType: string, handler: ProtectedActionHandler) => {
      protectedActionHandlers.current.set(actionType, handler);

      setHandlerVersion(currentVersion => currentVersion + 1);

      return () => {
        const currentHandler = protectedActionHandlers.current.get(actionType);

        if (currentHandler === handler) {
          protectedActionHandlers.current.delete(actionType);

          setHandlerVersion(currentVersion => currentVersion + 1);
        }
      };
    },
    []
  );

  useEffect(() => {
    const storedAction = readPendingAction();

    if (storedAction) {
      setPendingAction(storedAction);
    }
  }, []);

  useEffect(() => {
    if (isPending || !isAuthenticated || !pendingAction || resumingAction) {
      return;
    }

    const handler = protectedActionHandlers.current.get(pendingAction.type);

    if (!handler) {
      return;
    }

    const actionToResume = pendingAction;

    setResumingAction(true);

    /*
     * Remove it before execution so a failed handler
     * cannot enter an automatic retry loop.
     */
    clearPendingAction();

    void executeAction(actionToResume, handler).finally(() => {
      setResumingAction(false);
    });
  }, [
    clearPendingAction,
    executeAction,
    handlerVersion,
    isAuthenticated,
    isPending,
    pendingAction,
    resumingAction
  ]);

  useEffect(() => {
    return () => {
      dismissalTimers.current.forEach(timer => {
        window.clearTimeout(timer);
      });

      dismissalTimers.current.clear();
    };
  }, []);

  const dismissAuthenticationGate = useCallback(() => {
    setAuthenticationRequest(null);
    clearPendingAction();
  }, [clearPendingAction]);

  const navigateToAuthentication = useCallback(
    (route: '/sign-in' | '/sign-up') => {
      const returnTo = authenticationRequest?.action.returnTo ?? getCurrentReturnTo('/store');

      /*
       * Preserve the pending action, but close the
       * current dialog before navigating.
       */
      setAuthenticationRequest(null);

      router.push(buildAuthHref(route, returnTo));
    },
    [authenticationRequest, router]
  );

  const value = useMemo<ActionFeedbackContextValue>(
    () => ({
      success,
      error,
      warning,
      info,
      notify,
      dismiss,
      dismissAll,

      runProtectedAction,
      registerProtectedActionHandler,

      pendingAction,
      clearPendingAction,

      authenticationGateOpen: Boolean(authenticationRequest),

      resumingAction
    }),
    [
      authenticationRequest,
      clearPendingAction,
      dismiss,
      dismissAll,
      error,
      info,
      notify,
      pendingAction,
      registerProtectedActionHandler,
      resumingAction,
      runProtectedAction,
      success,
      warning
    ]
  );

  return (
    <ActionFeedbackContext.Provider value={value}>
      {children}

      <StoreExperienceOnboarding suppressed={Boolean(authenticationRequest)} />

      <AuthenticationGateDialog
        request={authenticationRequest}
        onDismiss={dismissAuthenticationGate}
        onSignIn={() => navigateToAuthentication('/sign-in')}
        onSignUp={() => navigateToAuthentication('/sign-up')}
      />

      <ActionFeedbackViewport messages={messages} onDismiss={dismiss} />
    </ActionFeedbackContext.Provider>
  );
}

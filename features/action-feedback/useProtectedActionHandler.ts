'use client';

import {
  useEffect
} from 'react';

import {
  useActionFeedback
} from './useActionFeedback';

import type {
  ProtectedActionHandler
} from './actionFeedbackTypes';

export function useProtectedActionHandler(
  actionType: string,
  handler: ProtectedActionHandler
): void {
  const {
    registerProtectedActionHandler
  } = useActionFeedback();

  useEffect(() => {
    return registerProtectedActionHandler(
      actionType,
      handler
    );
  }, [
    actionType,
    handler,
    registerProtectedActionHandler
  ]);
}
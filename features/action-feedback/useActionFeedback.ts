'use client';

import { useContext } from 'react';

import {
  ActionFeedbackContext
} from './actionFeedbackContext';

export function useActionFeedback() {
  const context = useContext(
    ActionFeedbackContext
  );

  if (!context) {
    throw new Error(
      'useActionFeedback must be used within ActionFeedbackProvider.'
    );
  }

  return context;
}
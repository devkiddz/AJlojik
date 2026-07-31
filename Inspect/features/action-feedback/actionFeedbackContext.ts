'use client';

import { createContext } from 'react';

import type {
  ActionFeedbackContextValue
} from './actionFeedbackTypes';

export const ActionFeedbackContext =
  createContext<ActionFeedbackContextValue | null>(null);
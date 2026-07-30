'use client';

import {
  useEffect,
  useState
} from 'react';

import {
  createPortal
} from 'react-dom';

import {
  ExperienceHistoryControl
} from './ExperienceNavigationControls';

const CUSTOMER_HISTORY_SLOT_ID =
  'customer-experience-history-slot';

export default function CustomerExperienceNavigationPortal() {
  const [
    historyTarget,
    setHistoryTarget
  ] =
    useState<HTMLElement | null>(
      null
    );

  useEffect(() => {
    const frameId =
      window.requestAnimationFrame(
        () => {
          setHistoryTarget(
            document.getElementById(
              CUSTOMER_HISTORY_SLOT_ID
            )
          );
        }
      );

    return () => {
      window.cancelAnimationFrame(
        frameId
      );
    };
  }, []);

  return historyTarget
    ? createPortal(
        <ExperienceHistoryControl />,
        historyTarget
      )
    : null;
}

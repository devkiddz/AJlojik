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
        <div
          className="
            [&>div]:flex-row
            [&>div]:gap-0
            [&>div>span]:hidden

            [&>div>button]:flex
            [&>div>button]:h-9
            [&>div>button]:w-auto
            [&>div>button]:items-center
            [&>div>button]:justify-center
            [&>div>button]:gap-2
            [&>div>button]:px-3
            [&>div>button]:pr-4

            [&>div>button]:after:content-['History']
            [&>div>button]:after:text-xs
            [&>div>button]:after:font-semibold
            [&>div>button]:after:text-foreground
          ">
          <ExperienceHistoryControl />
        </div>,
        historyTarget
      )
    : null;
}

'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  ExperienceBackControl,
  ExperienceHistoryControl
} from './ExperienceNavigationControls';

const CUSTOMER_BACK_SLOT_ID = 'customer-experience-back-slot';
const CUSTOMER_HISTORY_SLOT_ID = 'customer-experience-history-slot';

export default function CustomerExperienceNavigationPortal() {
  const [backTarget, setBackTarget] = useState<HTMLElement | null>(null);
  const [historyTarget, setHistoryTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setBackTarget(document.getElementById(CUSTOMER_BACK_SLOT_ID));
      setHistoryTarget(document.getElementById(CUSTOMER_HISTORY_SLOT_ID));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <>
      {backTarget ? createPortal(<ExperienceBackControl />, backTarget) : null}
      {historyTarget ? createPortal(<ExperienceHistoryControl />, historyTarget) : null}
    </>
  );
}

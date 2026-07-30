'use client';

import { useEffect, useRef } from 'react';

import { useActionFeedback } from '@/features/action-feedback';
import { requestCatalogRefresh } from '@/features/catalog';

function actionLabelFromSubmit(event: SubmitEvent): string {
  const submitter = event.submitter;

  if (!(submitter instanceof HTMLElement)) {
    return 'Changes';
  }

  return (
    submitter.dataset.feedbackLabel ||
    submitter.getAttribute('aria-label') ||
    submitter.textContent ||
    'Changes'
  ).trim();
}

function successCopy(label: string): { title: string; description: string } {
  const normalized = label.toLowerCase();

  if (normalized.includes('approve')) {
    return { title: 'Approval saved', description: `${label} was completed successfully.` };
  }

  if (normalized.includes('reject')) {
    return { title: 'Request rejected', description: `${label} was completed successfully.` };
  }

  if (normalized.includes('create') || normalized.includes('add')) {
    return { title: 'Created successfully', description: `${label} was completed.` };
  }

  if (normalized.includes('hide') || normalized.includes('show') || normalized.includes('activate')) {
    return { title: 'Visibility updated', description: `${label} was completed.` };
  }

  return { title: 'Changes saved', description: `${label} was completed successfully.` };
}

export function AdminActionFeedbackBridge() {
  const feedback = useActionFeedback();
  const latestActionLabelRef = useRef('Changes');

  useEffect(() => {
    const handleSubmit = (event: Event) => {
      latestActionLabelRef.current = actionLabelFromSubmit(event as SubmitEvent);
    };

    document.addEventListener('submit', handleSubmit, true);

    const originalFetch = window.fetch.bind(window);

    const patchedFetch: typeof window.fetch = async (input, init) => {
      const request = input instanceof Request ? input : null;
      const headers = new Headers(init?.headers ?? request?.headers);
      const isServerAction = headers.has('Next-Action');

      if (!isServerAction) {
        return originalFetch(input, init);
      }

      try {
        const response = await originalFetch(input, init);

        if (response.ok) {
          const copy = successCopy(latestActionLabelRef.current);

          feedback.success({
            title: copy.title,
            description: copy.description,
            groupKey: 'admin:server-action'
          });

          requestCatalogRefresh();
        } else {
          feedback.error({
            title: 'Action unsuccessful',
            description: `${latestActionLabelRef.current} could not be completed. Review the form and try again.`,
            groupKey: 'admin:server-action'
          });
        }

        return response;
      } catch (error) {
        feedback.error({
          title: 'Action unsuccessful',
          description:
            error instanceof Error && error.message
              ? error.message
              : `${latestActionLabelRef.current} could not be completed.`,
          groupKey: 'admin:server-action'
        });

        throw error;
      }
    };

    window.fetch = patchedFetch;

    return () => {
      document.removeEventListener('submit', handleSubmit, true);

      if (window.fetch === patchedFetch) {
        window.fetch = originalFetch;
      }
    };
  }, [feedback]);

  return null;
}

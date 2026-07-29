import type { FeedIntent } from '@/features/feed-experience/contracts';

export const CUSTOMER_EXPERIENCE_INTENT_EVENT = 'rcentz:customer-experience-intent';

export type CustomerExperienceIntentEventDetail = {
  pathname: string;
  intent: FeedIntent;
};

export function publishCustomerExperienceIntent(intent: FeedIntent): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<CustomerExperienceIntentEventDetail>(CUSTOMER_EXPERIENCE_INTENT_EVENT, {
      detail: {
        pathname: window.location.pathname,
        intent
      }
    })
  );
}

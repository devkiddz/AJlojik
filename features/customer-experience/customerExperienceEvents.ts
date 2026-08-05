import type { FeedIntent } from '@/features/feed-experience/contracts';

export const CUSTOMER_EXPERIENCE_INTENT_EVENT = 'rcentz:customer-experience-intent';

export const CUSTOMER_EXPERIENCE_START_FRESH_EVENT =
  'rcentz:customer-experience-start-fresh';

/* AJ_STORE_FRESH_RESET_V2 */

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

export function requestFreshStoreExperience(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new Event(
      CUSTOMER_EXPERIENCE_START_FRESH_EVENT
    )
  );
}

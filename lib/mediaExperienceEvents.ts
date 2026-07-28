export const MEDIA_EXPERIENCE_STATE_EVENT =
  'rcentz:media-experience-state';

export type MediaExperienceKind =
  | 'commerce-story'
  | 'store-reel';

export type MediaExperienceStateDetail = {
  ownerId: string;
  kind: MediaExperienceKind;
  open: boolean;
};

export function publishMediaExperienceState(
  detail: MediaExperienceStateDetail
): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<MediaExperienceStateDetail>(
      MEDIA_EXPERIENCE_STATE_EVENT,
      {
        detail
      }
    )
  );
}

export type CommerceStoryMediaType =
  | 'image'
  | 'video';

export type CommerceStoryType =
  | 'product'
  | 'promotion'
  | 'collection'
  | 'announcement';

export type CommerceStoryActionType =
  | 'product'
  | 'promotion'
  | 'collection'
  | 'vendor'
  | 'none';

export type CommerceStory = {
  id: string;

  workspaceId: string;
  vendorId?: string;

  title: string;
  label?: string;

  storyType: CommerceStoryType;
  mediaType: CommerceStoryMediaType;

  /**
   * Uploaded image or video shown inside the Story viewer.
   */
  mediaUrl: string;

  /**
   * Separately uploaded cover/poster displayed in the Story rail.
   * Video files never need to load before the user opens the Story.
   */
  coverUrl: string;

  /**
   * Used when a video needs a browser poster before playback.
   * Falls back to coverUrl when omitted.
   */
  posterUrl?: string;
  mediaObjectPosition?: string;
  coverObjectPosition?: string;
  posterObjectPosition?: string;

  actionType: CommerceStoryActionType;

  productIds?: string[];
  promotionId?: string;
  collectionId?: string;

  actionLabel?: string;
  actionHref?: string;

  /** Resolved Story playback duration in milliseconds. */
  durationMs?: number;

  startsAt?: string;
  endsAt?: string;

  active: boolean;
  priority: number;

  createdAt: string;
  updatedAt: string;
};
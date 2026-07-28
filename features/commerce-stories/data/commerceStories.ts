import type {
  CommerceStory
} from '../contracts';

export const commerceStories: CommerceStory[] = [
  {
    id: 'story-moet-nectar',
    workspaceId: 'aj-logik',

    title: 'Moët Nectar',
    label: 'New arrival',

    storyType: 'product',
    mediaType: 'video',

    mediaUrl:
      '/stories/moet-nectar.mp4',

    coverUrl:
      '/stories/covers/moet-nectar.webp',

    posterUrl:
      '/stories/covers/moet-nectar.webp',

    actionType: 'product',

    productIds: [
      'prod_1'
    ],

    actionLabel:
      'View product',

    active: true,
    priority: 100,

    createdAt:
      '2026-07-28T08:00:00.000Z',

    updatedAt:
      '2026-07-28T08:00:00.000Z'
  },

  {
    id: 'story-weekend-offer',
    workspaceId: 'aj-logik',

    title: 'Weekend Offer',
    label: '20% off',

    storyType: 'promotion',
    mediaType: 'image',

    mediaUrl:
      '/stories/weekend-offer.webp',

    coverUrl:
      '/stories/covers/weekend-offer.webp',

    actionType: 'promotion',

    promotionId:
      'weekend-discount',

    actionLabel:
      'View offer',

    active: true,
    priority: 90,

    createdAt:
      '2026-07-28T08:00:00.000Z',

    updatedAt:
      '2026-07-28T08:00:00.000Z'
  },

  {
    id: 'story-tonights-pour',
    workspaceId: 'aj-logik',

    title: 'Tonight’s Pour',
    label: 'Collection',

    storyType: 'collection',
    mediaType: 'video',

    mediaUrl:
      '/stories/tonights-pour.mp4',

    coverUrl:
      '/stories/covers/tonights-pour.webp',

    posterUrl:
      '/stories/covers/tonights-pour.webp',

    actionType: 'collection',

    collectionId:
      'tonights-pour',

    actionLabel:
      'Explore collection',

    active: true,
    priority: 80,

    createdAt:
      '2026-07-28T08:00:00.000Z',

    updatedAt:
      '2026-07-28T08:00:00.000Z'
  },

  {
    id: 'story-party-night',
    workspaceId: 'aj-logik',

    title: 'Party Night',
    label: 'Party plans',

    storyType: 'announcement',
    mediaType: 'image',

    mediaUrl:
      '/stories/party-night.webp',

    coverUrl:
      '/stories/covers/party-night.webp',

    actionType: 'none',

    active: true,
    priority: 70,

    createdAt:
      '2026-07-28T08:00:00.000Z',

    updatedAt:
      '2026-07-28T08:00:00.000Z'
  }
];
import type {
  StoreStudioReelProjection
} from '../contracts';

/**
 * Temporary Reel runtime fixtures while Store Studio campaign management
 * is unfinished. Database-backed Reel campaigns always take precedence.
 */
export const fallbackStoreReels:
  StoreStudioReelProjection[] = [
    {
      id: 'fallback-reel-moet-nectar',
      campaignId: 'fallback-reel-campaign-moet-nectar',
      workspaceId: 'aj-logik',
      vendorId: null,
      vendorName: 'AJ Logik',
      title: 'Moët Nectar',
      caption:
        'A richer expression for celebrations that deserve something memorable.',
      videoUrl: '/stories/moet-nectar.mp4',
      posterUrl: '/stories/covers/moet-nectar.webp',
      durationMs: null,
      autoplay: true,
      action: {
        label: 'View product',
        href: '/store'
      },
      detailHref: null,
      productId: 'prod_1',
      promotionId: null,
      collectionId: null,
      priority: 100
    },
    {
      id: 'fallback-reel-weekend-offer',
      campaignId: 'fallback-reel-campaign-weekend-offer',
      workspaceId: 'aj-logik',
      vendorId: null,
      vendorName: 'AJ Logik',
      title: 'Weekend Indulgence',
      caption:
        'Discover an atmospheric pour selected for the weekend.',
      videoUrl: '/stories/red-wine-pool.mp4',
      posterUrl: '/stories/covers/weekend-offer.webp',
      durationMs: null,
      autoplay: true,
      action: {
        label: 'View offer',
        href: '/store?category=deals'
      },
      detailHref: null,
      productId: null,
      promotionId: 'weekend-discount',
      collectionId: null,
      priority: 90
    },
    {
      id: 'fallback-reel-tonights-pour',
      campaignId: 'fallback-reel-campaign-tonights-pour',
      workspaceId: 'aj-logik',
      vendorId: null,
      vendorName: 'AJ Logik',
      title: 'Tonight’s Pour',
      caption:
        'A premium collection assembled for a calmer, richer evening.',
      videoUrl: '/stories/tonights-pour.mp4',
      posterUrl: '/stories/covers/tonights-pour.webp',
      durationMs: null,
      autoplay: true,
      action: {
        label: 'Explore collection',
        href: '/store'
      },
      detailHref: null,
      productId: null,
      promotionId: null,
      collectionId: 'tonights-pour',
      priority: 80
    }
  ];

import type {
  StoreStudioBannerSlideProjection
} from '../contracts';

/**
 * Temporary Store Showcase banner while the Store Studio admin is unfinished.
 *
 * It uses the dedicated AJ Logik wolf-and-bottle campaign artwork bundled
 * with the storefront so the fallback remains stable and production-safe.
 * To use an MP4 later, change `mediaType` to `video`, point `mediaUrl` to the
 * MP4 file, and provide an image `posterUrl`.
 */
export const fallbackStoreBannerSlides:
  StoreStudioBannerSlideProjection[] = [
    {
      id: 'fallback-store-banner',
      campaignId: 'fallback-store-banner-campaign',
      mediaType: 'image',
      mediaUrl: '/store-studio/banners/aj-logik-store-showcase.png',
      mobileMediaUrl: null,
      posterUrl: null,
      eyebrow: 'AJ Logik Store',
      title: 'Everything you need, beautifully curated.',
      description:
        'Discover wines, confectioneries, kitchen favourites, and party essentials selected for every moment.',
      primaryAction: {
        label: 'Shop the store',
        href: '/store'
      },
      secondaryAction: {
        label: 'Explore deals',
        href: '/store?category=deals'
      },
      autoplay: false,
      durationMs: 8000,
      position: 0
    }
  ];

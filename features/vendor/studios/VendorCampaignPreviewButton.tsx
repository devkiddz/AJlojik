'use client';

import { Clapperboard, Images } from 'lucide-react';

import {
  resolveStudioCroppedMedia,
  StudioPreviewDialog
} from '@/features/studio-controls';
import { cn } from '@/lib/utils';

type VendorCampaignPreview = {
  id: string;
  type: 'BANNER' | 'STORY' | 'REEL';
  status: string;
  title: string;
  description: string | null;
  assets: Array<{
    id: string;
    mediaType: 'IMAGE' | 'VIDEO';
    mediaUrl: string;
    mediaAsset?: { metadata: unknown } | null;
    mobileMediaUrl: string | null;
    mobileMediaAsset?: { metadata: unknown } | null;
    posterUrl: string | null;
    posterMediaAsset?: { metadata: unknown } | null;
    coverUrl: string | null;
    coverMediaAsset?: { metadata: unknown } | null;
    title: string | null;
    description: string | null;
    actionLabel: string | null;
  }>;
};

export function VendorCampaignPreviewButton({
  campaign
}: {
  campaign: VendorCampaignPreview;
}) {
  const firstAsset = campaign.assets[0];

  return (
    <StudioPreviewDialog
      title={`${campaign.title} preview`}
      description="Preview the saved campaign on desktop, tablet and mobile before submitting or resubmitting it."
      triggerLabel="Preview"
      className="h-9 px-3 text-[9px]"
    >
      {device => (
        <div className="min-h-[38rem] bg-muted/25 p-4 sm:p-6">
          <section
            className={cn(
              'relative mx-auto overflow-hidden rounded-[2rem] border bg-black text-white shadow-2xl',
              'max-w-md'
            )}
          >
            <div className="relative aspect-[9/16]">
              {firstAsset ? (
                <PreviewMedia
                  asset={firstAsset}
                  mobile={device === 'mobile'}
                />
              ) : (
                <div className="grid size-full place-items-center bg-muted text-muted-foreground">
                  <Images className="size-10" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-black/10" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.14em] text-white/65">
                  <Clapperboard className="size-4" />
                  {campaign.type} · {campaign.status.replaceAll('_', ' ')}
                </p>
                <h2 className="mt-3 text-2xl font-black">
                  {firstAsset?.title ?? campaign.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/70">
                  {firstAsset?.description ??
                    campaign.description ??
                    'No description supplied.'}
                </p>
                {firstAsset?.actionLabel ? (
                  <span className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-black">
                    {firstAsset.actionLabel}
                  </span>
                ) : null}
              </div>
              {!['ACTIVE', 'SCHEDULED'].includes(campaign.status) ? (
                <div className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[9px] font-black uppercase text-black">
                  Preview only
                </div>
              ) : null}
            </div>

            {campaign.assets.length > 1 ? (
              <div className="flex gap-2 overflow-x-auto border-t border-white/10 p-3">
                {campaign.assets.map((asset, index) => (
                  <div
                    key={asset.id}
                    className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border border-white/15"
                  >
                    <PreviewMedia asset={asset} mobile={device === 'mobile'} />
                    <span className="absolute left-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[8px] font-bold">
                      {index + 1}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      )}
    </StudioPreviewDialog>
  );
}

function PreviewMedia({
  asset,
  mobile
}: {
  asset: VendorCampaignPreview['assets'][number];
  mobile: boolean;
}) {
  const rawSource = mobile
    ? asset.mobileMediaUrl ?? asset.mediaUrl
    : asset.mediaUrl;
  const sourceMetadata = mobile && asset.mobileMediaUrl
    ? asset.mobileMediaAsset?.metadata
    : asset.mediaAsset?.metadata;
  const source = resolveStudioCroppedMedia(
    rawSource,
    sourceMetadata,
    'story'
  );
  const rawPoster = asset.posterUrl ?? asset.coverUrl;
  const poster = rawPoster
    ? resolveStudioCroppedMedia(
        rawPoster,
        asset.posterUrl
          ? asset.posterMediaAsset?.metadata
          : asset.coverMediaAsset?.metadata,
        asset.posterUrl ? 'video-poster' : 'reel-cover'
      )
    : null;

  if (asset.mediaType === 'VIDEO') {
    return (
      <video
        src={rawSource}
        poster={poster?.url}
        muted
        playsInline
        controls
        className="size-full object-cover"
        style={{ objectPosition: source.objectPosition }}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={source.url}
      alt=""
      className="size-full object-cover"
      style={{ objectPosition: source.objectPosition }}
    />
  );
}

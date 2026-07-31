'use client';

import { useMemo, useState } from 'react';
import { Clapperboard, ImageIcon, Layers3, Laptop } from 'lucide-react';

import {
  resolveStudioCroppedMedia,
  StudioPreviewDialog,
  StudioSelectField
} from '@/features/studio-controls';
import { cn } from '@/lib/utils';

import type { StoreStudioAdminCampaign } from './storeStudioAdminTypes';

export function StoreStudioPreviewer({ campaigns }: { campaigns: StoreStudioAdminCampaign[] }) {
  const [campaignId, setCampaignId] = useState(campaigns[0]?.id ?? '');
  const campaign = useMemo(
    () => campaigns.find(item => item.id === campaignId) ?? campaigns[0] ?? null,
    [campaignId, campaigns]
  );

  if (!campaign) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs font-bold text-muted-foreground">
        <Laptop className="size-4" /> No campaign to preview
      </span>
    );
  }

  return (
    <StudioPreviewDialog
      title="Store Studio campaign preview"
      description="Preview saved Draft, pending, paused, rejected, scheduled or live content without depending on the public Store projection."
      triggerLabel="Studio preview">
      {device => (
        <div className="min-h-[42rem] bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_38%)] p-4 sm:p-6">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="flex flex-col gap-3 rounded-2xl border bg-card/85 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">Saved campaign · {campaign.status.replaceAll('-', ' ')}</p>
                <p className="mt-1 truncate text-sm font-black">{campaign.title}</p>
              </div>
              <StudioSelectField
                value={campaign.id}
                onValueChange={setCampaignId}
                options={campaigns.map(item => ({
                  value: item.id,
                  label: `${item.type.toUpperCase()} · ${item.title} · ${item.status}`
                }))}
                className="min-w-64 text-xs font-bold"
              />
            </div>

            <CampaignPreview campaign={campaign} device={device} />
          </div>
        </div>
      )}
    </StudioPreviewDialog>
  );
}

function CampaignPreview({ campaign, device }: { campaign: StoreStudioAdminCampaign; device: 'desktop' | 'tablet' | 'mobile' }) {
  const portrait = campaign.type === 'story' || campaign.type === 'reel';
  const Icon = campaign.type === 'banner' ? ImageIcon : campaign.type === 'story' ? Layers3 : Clapperboard;

  return (
    <section className={cn('mx-auto overflow-hidden rounded-[2rem] border bg-black text-white shadow-2xl', portrait ? 'max-w-md' : 'w-full')}>
      <div className={cn('relative', portrait ? 'aspect-[9/16]' : device === 'mobile' ? 'aspect-[4/5]' : 'aspect-[16/7]')}>
        {campaign.assets[0] ? <PreviewMedia asset={campaign.assets[0]} campaignType={campaign.type} mobile={device === 'mobile'} /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/70"><Icon className="size-4" />{campaign.type} · {campaign.placementTier}</div>
          <h2 className="mt-3 text-2xl font-black sm:text-4xl">{campaign.assets[0]?.title ?? campaign.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{campaign.assets[0]?.description ?? campaign.description ?? 'No campaign description supplied.'}</p>
          {campaign.assets[0]?.actionLabel ? <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-black">{campaign.assets[0].actionLabel}</span> : null}
        </div>
        {!campaign.active || ['paused', 'rejected', 'expired'].includes(campaign.status) ? <div className="absolute right-3 top-3 rounded-full bg-amber-400 px-3 py-1 text-[9px] font-black uppercase text-black">Preview only · {campaign.status}</div> : null}
      </div>

      {campaign.assets.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto border-t border-white/10 bg-black p-3">
          {campaign.assets.map((asset, index) => <div key={asset.id} className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl border border-white/15"><PreviewMedia asset={asset} campaignType={campaign.type} mobile={device === 'mobile'} /><span className="absolute left-1 top-1 rounded bg-black/65 px-1.5 py-0.5 text-[8px] font-bold">{index + 1}</span></div>)}
        </div>
      ) : null}
    </section>
  );
}

function PreviewMedia({
  asset,
  campaignType,
  mobile
}: {
  asset: StoreStudioAdminCampaign['assets'][number];
  campaignType: StoreStudioAdminCampaign['type'];
  mobile: boolean;
}) {
  const rawSource = mobile
    ? asset.mobileMediaUrl ?? asset.mediaUrl
    : asset.mediaUrl;
  const sourceMetadata = mobile && asset.mobileMediaUrl
    ? asset.mobileMediaAssetMetadata
    : asset.mediaAssetMetadata;
  const purpose = campaignType === 'banner'
    ? mobile
      ? 'banner-mobile'
      : 'banner-desktop'
    : campaignType === 'story'
      ? 'story'
      : 'reel-cover';
  const source = resolveStudioCroppedMedia(
    rawSource,
    sourceMetadata,
    purpose
  );
  const rawPoster = asset.posterUrl ?? asset.coverUrl;
  const poster = rawPoster
    ? resolveStudioCroppedMedia(
        rawPoster,
        asset.posterUrl
          ? asset.posterMediaAssetMetadata
          : asset.coverMediaAssetMetadata,
        asset.posterUrl ? 'video-poster' : campaignType === 'story' ? 'story' : 'reel-cover'
      )
    : null;

  if (asset.mediaType === 'video') {
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

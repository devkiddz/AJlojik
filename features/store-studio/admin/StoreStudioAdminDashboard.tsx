import type { ReactNode } from 'react';

import Link from 'next/link';

import {
  Archive,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BadgeCheck,
  CalendarClock,
  CirclePause,
  CirclePlay,
  Clapperboard,
  Eye,
  FileClock,
  ImageIcon,
  Layers3,
  Megaphone,
  PencilLine,
  Plus,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Video
} from 'lucide-react';

import { cn } from '@/lib/utils';

import {
  addStoreStudioAsset,
  archiveStoreStudioCampaign,
  createStoreStudioCampaign,
  moveStoreStudioAsset,
  transitionStoreStudioCampaign,
  updateStoreStudioAsset,
  updateStoreStudioCampaign
} from './campaignActions';
import type {
  StoreStudioAdminAsset,
  StoreStudioAdminCampaign,
  StoreStudioAdminDashboardData,
  StoreStudioDestinationOption,
  StoreStudioAdminMediaAsset
} from './storeStudioAdminTypes';
import { StoreStudioSubmitButton } from './StoreStudioSubmitButton';
import { StoreStudioMediaSelector } from './StoreStudioMediaSelector';
import { StoreStudioPreviewer } from './StoreStudioPreviewer';

type StoreStudioAdminDashboardProps = {
  data: StoreStudioAdminDashboardData;
  canReview: boolean;
  administratorName: string;
};

type CampaignType = StoreStudioAdminCampaign['type'];
type CampaignStatus = StoreStudioAdminCampaign['status'];

type DestinationGroups = Pick<
  StoreStudioAdminDashboardData,
  'products' | 'promotions' | 'collections'
>;

const typePresentation: Record<
  CampaignType,
  {
    label: string;
    description: string;
    icon: ReactNode;
    badge: string;
    surface: string;
  }
> = {
  banner: {
    label: 'Banners',
    description: 'Store showcase slides and campaign hero media.',
    icon: <ImageIcon />,
    badge: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    surface: 'from-sky-500/10 via-transparent to-transparent'
  },
  story: {
    label: 'Stories',
    description: 'Short campaign sequences presented from the showcase.',
    icon: <Layers3 />,
    badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    surface: 'from-amber-500/10 via-transparent to-transparent'
  },
  reel: {
    label: 'Reels',
    description: 'Portrait video experiences with commerce destinations.',
    icon: <Clapperboard />,
    badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
    surface: 'from-rose-500/10 via-transparent to-transparent'
  }
};

const statusPresentation: Record<
  CampaignStatus,
  {
    label: string;
    className: string;
  }
> = {
  draft: {
    label: 'Draft',
    className: 'bg-muted text-muted-foreground'
  },
  'pending-review': {
    label: 'Awaiting review',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
  },
  approved: {
    label: 'Approved',
    className: 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
  },
  scheduled: {
    label: 'Scheduled',
    className: 'bg-violet-500/10 text-violet-700 dark:text-violet-300'
  },
  active: {
    label: 'Live',
    className: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
  },
  paused: {
    label: 'Paused',
    className: 'bg-orange-500/10 text-orange-700 dark:text-orange-300'
  },
  expired: {
    label: 'Expired',
    className: 'bg-slate-500/10 text-slate-700 dark:text-slate-300'
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-destructive/10 text-destructive'
  }
};

const inputClassName =
  'h-11 w-full rounded-xl border border-border/70 bg-background px-3 text-xs outline-none transition placeholder:text-muted-foreground/60 focus:border-primary';
const textareaClassName =
  'min-h-24 w-full resize-y rounded-xl border border-border/70 bg-background px-3 py-3 text-xs leading-5 outline-none transition placeholder:text-muted-foreground/60 focus:border-primary';
const selectClassName = inputClassName;

export function StoreStudioAdminDashboard({
  data,
  canReview,
  administratorName
}: StoreStudioAdminDashboardProps) {
  const destinationGroups: DestinationGroups = {
    products: data.products,
    promotions: data.promotions,
    collections: data.collections
  };

  return (
    <main className="admin-page min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_34%)] px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/85 shadow-xl">
          <div className="relative p-5 sm:p-7">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-amber-500/10"
            />

            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground transition hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Admin attention center
                </Link>

                <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">
                  {data.workspace.name} · {data.workspace.mode}
                </p>

                <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">
                  Store Studio
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Create, schedule, review, and publish the banners, Stories, and Reels that shape the live Store experience.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="size-4" />
                  {canReview ? 'Publishing authority' : 'Campaign manager'}
                </span>

                <StoreStudioPreviewer />

                <Link
                  href="/store"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-4 py-2 text-xs font-bold transition hover:bg-muted"
                >
                  <Eye className="size-4" />
                  Open Store
                </Link>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
          <MetricCard label="Campaigns" value={data.metrics.total} icon={<Megaphone />} tone="violet" />
          <MetricCard label="Live" value={data.metrics.live} icon={<CirclePlay />} tone="emerald" />
          <MetricCard label="Scheduled" value={data.metrics.scheduled} icon={<CalendarClock />} tone="blue" />
          <MetricCard label="Drafts" value={data.metrics.drafts} icon={<FileClock />} tone="slate" />
          <MetricCard label="Review" value={data.metrics.awaitingReview} icon={<BadgeCheck />} tone="amber" />
          <MetricCard label="Banners" value={data.metrics.banners} icon={<ImageIcon />} tone="blue" />
          <MetricCard label="Stories" value={data.metrics.stories} icon={<Layers3 />} tone="amber" />
          <MetricCard label="Reels" value={data.metrics.reels} icon={<Clapperboard />} tone="rose" />
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(22rem,0.75fr)_minmax(0,1.25fr)]">
          <aside className="self-start xl:sticky xl:top-5">
            <CreateCampaignPanel
              canReview={canReview}
              destinations={destinationGroups}
              media={data.media}
            />
          </aside>

          <div className="space-y-5">
            {(['banner', 'story', 'reel'] as const).map(type => (
              <CampaignTypeSection
                key={type}
                type={type}
                campaigns={data.campaigns.filter(campaign => campaign.type === type)}
                canReview={canReview}
                destinations={destinationGroups}
                media={data.media}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
                <Sparkles className="size-5" />
              </div>

              <div>
                <h2 className="font-bold">Database-controlled Store presentation</h2>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Published Store media is resolved from Store Studio campaigns. Static banners, Stories, and Reels remain whole-projection fallbacks only.
                </p>
              </div>
            </div>

            <span className="rounded-full border border-primary/20 px-3 py-2 text-[9px] font-bold uppercase text-primary">
              Managed by {administratorName}
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}

function CreateCampaignPanel({
  canReview,
  destinations,
  media
}: {
  canReview: boolean;
  destinations: DestinationGroups;
  media: StoreStudioAdminMediaAsset[];
}) {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/85 p-5 shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">
            New experience
          </p>
          <h2 className="mt-1 text-xl font-black">Create campaign</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Every campaign begins with one asset. Add more media after creation.
          </p>
        </div>

        <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Plus className="size-5" />
        </span>
      </div>

      <form action={createStoreStudioCampaign} className="mt-5 space-y-4">
        <CampaignFields canReview={canReview} />

        <div className="border-t border-border/60 pt-4">
          <p className="text-xs font-black">First asset</p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            Reels are always video. Banners and Stories may use image or video media.
          </p>
        </div>

        <AssetFields destinations={destinations} media={media} />

        <StoreStudioSubmitButton
          className="w-full bg-foreground text-background hover:opacity-90"
          pendingLabel="Creating campaign…"
        >
          <Plus className="size-4" />
          Create campaign
        </StoreStudioSubmitButton>
      </form>
    </section>
  );
}

function CampaignTypeSection({
  type,
  campaigns,
  canReview,
  destinations,
  media
}: {
  type: CampaignType;
  campaigns: StoreStudioAdminCampaign[];
  canReview: boolean;
  destinations: DestinationGroups;
  media: StoreStudioAdminMediaAsset[];
}) {
  const presentation = typePresentation[type];

  return (
    <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-card/75 shadow-lg">
      <header className="relative border-b border-border/60 p-5 sm:p-6">
        <div
          aria-hidden="true"
          className={cn('absolute inset-0 bg-gradient-to-br', presentation.surface)}
        />

        <div className="relative flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className={cn('grid size-11 shrink-0 place-items-center rounded-2xl [&_svg]:size-5', presentation.badge)}>
              {presentation.icon}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black">{presentation.label}</h2>
                <span className="rounded-full bg-muted px-2.5 py-1 text-[9px] font-bold text-muted-foreground">
                  {campaigns.length}
                </span>
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {presentation.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        {campaigns.length ? (
          campaigns.map(campaign => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              canReview={canReview}
              destinations={destinations}
              media={media}
            />
          ))
        ) : (
          <div className="grid min-h-36 place-items-center rounded-3xl border border-dashed border-border/70 p-6 text-center">
            <div>
              <span className={cn('mx-auto grid size-11 place-items-center rounded-2xl [&_svg]:size-5', presentation.badge)}>
                {presentation.icon}
              </span>
              <p className="mt-3 text-sm font-bold">No {presentation.label.toLowerCase()} yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use the campaign creator to publish the first one.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CampaignCard({
  campaign,
  canReview,
  destinations,
  media
}: {
  campaign: StoreStudioAdminCampaign;
  canReview: boolean;
  destinations: DestinationGroups;
  media: StoreStudioAdminMediaAsset[];
}) {
  const status = statusPresentation[campaign.status];
  const type = typePresentation[campaign.type];

  return (
    <article className="overflow-hidden rounded-3xl border border-border/60 bg-background/65">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <span className={cn('grid size-10 shrink-0 place-items-center rounded-2xl [&_svg]:size-4', type.badge)}>
              {type.icon}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base font-black sm:text-lg">{campaign.title}</h3>
                <span className={cn('rounded-full px-2.5 py-1 text-[9px] font-bold', status.className)}>
                  {status.label}
                </span>
                <span className="rounded-full border border-border/70 px-2.5 py-1 text-[9px] font-bold uppercase text-muted-foreground">
                  {campaign.placementTier}
                </span>
              </div>

              {campaign.description ? (
                <p className="mt-2 line-clamp-2 max-w-3xl text-xs leading-5 text-muted-foreground">
                  {campaign.description}
                </p>
              ) : null}

              <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
                <span>{campaign.assets.length} asset{campaign.assets.length === 1 ? '' : 's'}</span>
                <span>Priority {campaign.requestedPriority + campaign.adminWeight}</span>
                <span>{formatSchedule(campaign)}</span>
                {campaign.vendorName ? <span>Vendor: {campaign.vendorName}</span> : <span>Workspace campaign</span>}
              </div>
            </div>
          </div>

          <CampaignActions campaign={campaign} canReview={canReview} />
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {campaign.assets.map((asset, index) => (
            <AssetSummary
              key={asset.id}
              asset={asset}
              index={index}
              total={campaign.assets.length}
              campaign={campaign}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-border/60 bg-muted/15 p-3 sm:p-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <details className="group rounded-2xl border border-border/60 bg-background/75 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-2">
                <PencilLine className="size-4 text-primary" />
                Edit campaign settings
              </span>
              <span className="text-muted-foreground transition group-open:rotate-180">⌄</span>
            </summary>

            <form action={updateStoreStudioCampaign} className="mt-5 space-y-4">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <CampaignFields campaign={campaign} canReview={canReview} />

              <StoreStudioSubmitButton
                className="w-full bg-foreground text-background hover:opacity-90"
                pendingLabel="Updating campaign…"
              >
                Save campaign
              </StoreStudioSubmitButton>
            </form>
          </details>

          <details className="group rounded-2xl border border-border/60 bg-background/75 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold">
              <span className="inline-flex items-center gap-2">
                <Plus className="size-4 text-primary" />
                Add {campaign.type} asset
              </span>
              <span className="text-muted-foreground transition group-open:rotate-180">⌄</span>
            </summary>

            <form action={addStoreStudioAsset} className="mt-5 space-y-4">
              <input type="hidden" name="campaignId" value={campaign.id} />
              <AssetFields campaignType={campaign.type} destinations={destinations} media={media} />

              <StoreStudioSubmitButton
                className="w-full bg-primary text-primary-foreground hover:opacity-90"
                pendingLabel="Adding asset…"
              >
                Add asset
              </StoreStudioSubmitButton>
            </form>
          </details>
        </div>

        {campaign.assets.map((asset, index) => (
          <details
            key={asset.id}
            className="group mt-3 rounded-2xl border border-border/60 bg-background/75 p-4"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-bold">
              <span className="inline-flex min-w-0 items-center gap-2">
                {asset.mediaType === 'video' ? (
                  <Video className="size-4 shrink-0 text-primary" />
                ) : (
                  <ImageIcon className="size-4 shrink-0 text-primary" />
                )}
                <span className="truncate">
                  Edit asset {index + 1}: {asset.title ?? campaign.title}
                </span>
              </span>
              <span className="text-muted-foreground transition group-open:rotate-180">⌄</span>
            </summary>

            <form action={updateStoreStudioAsset} className="mt-5 space-y-4">
              <input type="hidden" name="assetId" value={asset.id} />
              <AssetFields
                asset={asset}
                campaignType={campaign.type}
                destinations={destinations}
                media={media}
              />

              <StoreStudioSubmitButton
                className="w-full bg-foreground text-background hover:opacity-90"
                pendingLabel="Updating asset…"
              >
                Save asset
              </StoreStudioSubmitButton>
            </form>
          </details>
        ))}
      </div>
    </article>
  );
}

function CampaignFields({
  campaign,
  canReview
}: {
  campaign?: StoreStudioAdminCampaign;
  canReview: boolean;
}) {
  const editableStatus =
    !campaign ||
    canReview ||
    campaign.status === 'draft' ||
    campaign.status === 'pending-review'
      ? campaign?.status ?? (canReview ? 'active' : 'pending-review')
      : 'pending-review';

  return (
    <>
      {!campaign ? (
        <Field label="Campaign type">
          <select name="campaignType" className={selectClassName} defaultValue="BANNER">
            <option value="BANNER">Banner</option>
            <option value="STORY">Story</option>
            <option value="REEL">Reel</option>
          </select>
        </Field>
      ) : null}

      <Field label="Campaign title">
        <input
          name="campaignTitle"
          required
          defaultValue={campaign?.title ?? ''}
          placeholder="Weekend Store experience"
          className={inputClassName}
        />
      </Field>

      <Field label="Campaign description" optional>
        <textarea
          name="campaignDescription"
          defaultValue={campaign?.description ?? ''}
          placeholder="Describe the campaign purpose and presentation."
          className={textareaClassName}
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Status">
          <select
            name="status"
            defaultValue={editableStatus.toUpperCase().replaceAll('-', '_')}
            className={selectClassName}
          >
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending review</option>
            {canReview ? (
              <>
                <option value="APPROVED">Approved</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="EXPIRED">Expired</option>
                <option value="REJECTED">Rejected</option>
              </>
            ) : null}
          </select>
        </Field>

        <Field label="Placement tier">
          <select
            name="placementTier"
            defaultValue={(campaign?.placementTier ?? 'standard').toUpperCase()}
            className={selectClassName}
          >
            <option value="STANDARD">Standard</option>
            <option value="FEATURED">Featured</option>
            <option value="PREMIUM">Premium</option>
            <option value="SPONSORED">Sponsored</option>
          </select>
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Starts at (UTC)" optional>
          <input
            type="datetime-local"
            name="startsAt"
            defaultValue={toDateTimeLocal(campaign?.startsAt ?? null)}
            className={inputClassName}
          />
        </Field>

        <Field label="Ends at (UTC)" optional>
          <input
            type="datetime-local"
            name="endsAt"
            defaultValue={toDateTimeLocal(campaign?.endsAt ?? null)}
            className={inputClassName}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Requested priority">
          <input
            type="number"
            name="requestedPriority"
            min={-100}
            max={100}
            defaultValue={campaign?.requestedPriority ?? 0}
            className={inputClassName}
          />
        </Field>

        {canReview ? (
          <Field label="Admin weight">
            <input
              type="number"
              name="adminWeight"
              min={-100}
              max={100}
              defaultValue={campaign?.adminWeight ?? 0}
              className={inputClassName}
            />
          </Field>
        ) : null}
      </div>
    </>
  );
}

function AssetFields({
  asset,
  campaignType,
  destinations,
  media
}: {
  asset?: StoreStudioAdminAsset;
  campaignType?: CampaignType;
  destinations: DestinationGroups;
  media: StoreStudioAdminMediaAsset[];
}) {
  const destinationValue = resolveDestinationValue(asset);
  const reel = campaignType === 'reel';

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Media type">
          <select
            name="mediaType"
            defaultValue={reel ? 'VIDEO' : (asset?.mediaType ?? 'image').toUpperCase()}
            disabled={reel}
            className={selectClassName}
          >
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
          </select>
          {reel ? <input type="hidden" name="mediaType" value="VIDEO" /> : null}
        </Field>

        <Field label="Duration in seconds" optional>
          <input
            type="number"
            name="durationSeconds"
            min={0}
            max={3600}
            defaultValue={
              asset?.durationSeconds ??
              (campaignType === 'story'
                ? 5
                : campaignType === 'banner'
                  ? 6
                  : '')
            }
            className={inputClassName}
          />
        </Field>
      </div>

      <StoreStudioMediaSelector
        media={media}
        campaignType={campaignType}
        initial={asset ? {
          mediaAssetId: asset.mediaAssetId,
          mobileMediaAssetId: asset.mobileMediaAssetId,
          posterMediaAssetId: asset.posterMediaAssetId,
          coverMediaAssetId: asset.coverMediaAssetId
        } : undefined}
      />

      <details className="rounded-2xl border border-border/60 bg-background/55 p-3">
        <summary className="cursor-pointer text-[10px] font-bold text-muted-foreground">Advanced external media fallback</summary>
        <div className="mt-3 space-y-3">
          <Field label="Primary external URL" optional><input name="mediaUrl" defaultValue={asset?.mediaAssetId ? '' : asset?.mediaUrl ?? ''} placeholder="Used only when no Media Studio asset is selected" className={inputClassName} /></Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Mobile external URL" optional><input name="mobileMediaUrl" defaultValue={asset?.mobileMediaAssetId ? '' : asset?.mobileMediaUrl ?? ''} className={inputClassName} /></Field>
            <Field label="Poster external URL" optional><input name="posterUrl" defaultValue={asset?.posterMediaAssetId ? '' : asset?.posterUrl ?? ''} className={inputClassName} /></Field>
          </div>
          <Field label="Cover external URL" optional><input name="coverUrl" defaultValue={asset?.coverMediaAssetId ? '' : asset?.coverUrl ?? ''} className={inputClassName} /></Field>
        </div>
      </details>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Eyebrow / label" optional>
          <input
            name="eyebrow"
            defaultValue={asset?.eyebrow ?? ''}
            placeholder="Featured this week"
            className={inputClassName}
          />
        </Field>

        <Field label="Asset title" optional>
          <input
            name="assetTitle"
            defaultValue={asset?.title ?? ''}
            placeholder="Overrides campaign title"
            className={inputClassName}
          />
        </Field>
      </div>

      <Field label="Asset description / caption" optional>
        <textarea
          name="assetDescription"
          defaultValue={asset?.description ?? ''}
          placeholder="Banner copy, Story context, or Reel caption."
          className={textareaClassName}
        />
      </Field>

      <Field label="Commerce destination" optional>
        <select name="destination" defaultValue={destinationValue} className={selectClassName}>
          <option value="">No linked destination</option>
          {destinations.products.length ? (
            <optgroup label="Products">
              {destinations.products.map(option => (
                <DestinationOption key={`product:${option.id}`} prefix="product" option={option} />
              ))}
            </optgroup>
          ) : null}
          {destinations.promotions.length ? (
            <optgroup label="Promotions">
              {destinations.promotions.map(option => (
                <DestinationOption key={`promotion:${option.id}`} prefix="promotion" option={option} />
              ))}
            </optgroup>
          ) : null}
          {destinations.collections.length ? (
            <optgroup label="Collections">
              {destinations.collections.map(option => (
                <DestinationOption key={`collection:${option.id}`} prefix="collection" option={option} />
              ))}
            </optgroup>
          ) : null}
        </select>
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Action label" optional>
          <input
            name="actionLabel"
            defaultValue={asset?.actionLabel ?? ''}
            placeholder="Shop now"
            className={inputClassName}
          />
        </Field>

        <Field label="Custom action URL" optional>
          <input
            name="actionHref"
            defaultValue={destinationValue ? '' : (asset?.actionHref ?? '')}
            placeholder="Derived automatically when empty"
            className={inputClassName}
          />
        </Field>
      </div>

      <input type="hidden" name="activeAssetPresent" value="true" />

      <div className="grid gap-2 sm:grid-cols-3">
        <CheckboxField
          name="autoplay"
          label="Autoplay"
          defaultChecked={asset?.autoplay ?? false}
        />
        <CheckboxField
          name="muted"
          label="Start muted"
          defaultChecked={asset?.muted ?? true}
        />
        <CheckboxField
          name="activeAsset"
          label="Asset active"
          defaultChecked={asset?.active ?? true}
        />
      </div>
    </>
  );
}

function CampaignActions({
  campaign,
  canReview
}: {
  campaign: StoreStudioAdminCampaign;
  canReview: boolean;
}) {
  const actions: Array<{
    transition: string;
    label: string;
    icon: ReactNode;
    className: string;
  }> = [];

  if (['draft', 'rejected'].includes(campaign.status)) {
    actions.push({
      transition: 'submit',
      label: 'Submit',
      icon: <Send />,
      className: 'border border-border/70 bg-background hover:bg-muted'
    });
  }

  if (campaign.status === 'pending-review' && canReview) {
    actions.push(
      {
        transition: 'approve',
        label: 'Approve',
        icon: <BadgeCheck />,
        className: 'bg-blue-600 text-white hover:bg-blue-700'
      },
      {
        transition: 'reject',
        label: 'Reject',
        icon: <CirclePause />,
        className: 'border border-destructive/30 text-destructive hover:bg-destructive/10'
      }
    );
  }

  if (canReview && ['approved', 'scheduled'].includes(campaign.status)) {
    actions.push({
      transition: 'activate',
      label: 'Publish',
      icon: <CirclePlay />,
      className: 'bg-emerald-600 text-white hover:bg-emerald-700'
    });
  }

  if (campaign.status === 'active') {
    actions.push({
      transition: 'pause',
      label: 'Pause',
      icon: <CirclePause />,
      className: 'border border-border/70 bg-background hover:bg-muted'
    });
  }

  if (campaign.status === 'paused') {
    actions.push({
      transition: 'resume',
      label: 'Resume',
      icon: <RotateCcw />,
      className: 'bg-emerald-600 text-white hover:bg-emerald-700'
    });
  }

  if (canReview && !['expired'].includes(campaign.status)) {
    actions.push({
      transition: 'expire',
      label: 'Expire',
      icon: <FileClock />,
      className: 'border border-border/70 bg-background hover:bg-muted'
    });
  }

  return (
    <div className="flex flex-wrap gap-2 lg:max-w-sm lg:justify-end">
      {actions.map(action => (
        <form key={action.transition} action={transitionStoreStudioCampaign}>
          <input type="hidden" name="campaignId" value={campaign.id} />
          <input type="hidden" name="transition" value={action.transition} />
          <StoreStudioSubmitButton
            className={cn('min-h-9 px-3 [&_svg]:size-3.5', action.className)}
            pendingLabel="Working…"
          >
            {action.icon}
            {action.label}
          </StoreStudioSubmitButton>
        </form>
      ))}

      {canReview ? (
        <form action={archiveStoreStudioCampaign}>
          <input type="hidden" name="campaignId" value={campaign.id} />
          <StoreStudioSubmitButton
            className="min-h-9 border border-destructive/30 px-3 text-destructive hover:bg-destructive/10 [&_svg]:size-3.5"
            pendingLabel="Archiving…"
          >
            <Archive />
            Archive
          </StoreStudioSubmitButton>
        </form>
      ) : null}
    </div>
  );
}

function AssetSummary({
  asset,
  index,
  total,
  campaign
}: {
  asset: StoreStudioAdminAsset;
  index: number;
  total: number;
  campaign: StoreStudioAdminCampaign;
}) {
  const destination = asset.productId
    ? 'Product'
    : asset.promotionId
      ? 'Promotion'
      : asset.collectionId
        ? 'Collection'
        : asset.actionHref
          ? 'Custom link'
          : 'No destination';

  return (
    <article className="relative min-h-40 overflow-hidden rounded-2xl border border-border/60 bg-zinc-950 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-amber-950 to-emerald-950"
      />

      {asset.mediaType === 'image' ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-65"
          style={{ backgroundImage: `url(${JSON.stringify(asset.mediaUrl)})` }}
        />
      ) : asset.posterUrl || asset.coverUrl ? (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center opacity-65"
          style={{ backgroundImage: `url(${JSON.stringify(asset.posterUrl ?? asset.coverUrl)})` }}
        />
      ) : null}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-black/20" />

      <div className="relative flex min-h-40 flex-col p-3">
        <div className="flex items-start justify-between gap-2">
          <span className="rounded-full border border-white/15 bg-black/40 px-2 py-1 text-[9px] font-bold backdrop-blur">
            {asset.mediaType.toUpperCase()} · {index + 1}/{total}
          </span>

          <span className={cn('rounded-full px-2 py-1 text-[9px] font-bold', asset.active ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-white/50')}>
            {asset.active ? 'Active' : 'Hidden'}
          </span>
        </div>

        <div className="mt-auto">
          <p className="line-clamp-2 text-xs font-black">
            {asset.title ?? campaign.title}
          </p>
          <p className="mt-1 text-[9px] text-white/55">{destination}</p>

          <div className="mt-3 flex gap-2">
            <form action={moveStoreStudioAsset}>
              <input type="hidden" name="assetId" value={asset.id} />
              <input type="hidden" name="direction" value="up" />
              <button
                type="submit"
                disabled={index === 0}
                aria-label="Move asset up"
                className="grid size-8 place-items-center rounded-full border border-white/15 bg-black/40 transition hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowUp className="size-3.5" />
              </button>
            </form>

            <form action={moveStoreStudioAsset}>
              <input type="hidden" name="assetId" value={asset.id} />
              <input type="hidden" name="direction" value="down" />
              <button
                type="submit"
                disabled={index === total - 1}
                aria-label="Move asset down"
                className="grid size-8 place-items-center rounded-full border border-white/15 bg-black/40 transition hover:bg-white/10 disabled:opacity-30"
              >
                <ArrowDown className="size-3.5" />
              </button>
            </form>

            <a
              href={asset.mediaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 text-[9px] font-bold transition hover:bg-white/10"
            >
              <Eye className="size-3.5" />
              Media
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function DestinationOption({
  prefix,
  option
}: {
  prefix: 'product' | 'promotion' | 'collection';
  option: StoreStudioDestinationOption;
}) {
  return <option value={`${prefix}:${option.id}`}>{option.label}</option>;
}

function Field({
  label,
  optional = false,
  children
}: {
  label: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between gap-2 text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
        {optional ? <span className="normal-case tracking-normal text-muted-foreground/60">Optional</span> : null}
      </span>
      {children}
    </label>
  );
}

function CheckboxField({
  name,
  label,
  defaultChecked
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 bg-background px-3 text-xs font-semibold">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-border accent-primary"
      />
      {label}
    </label>
  );
}

function MetricCard({
  label,
  value,
  icon,
  tone
}: {
  label: string;
  value: number;
  icon: ReactNode;
  tone: 'violet' | 'amber' | 'blue' | 'emerald' | 'slate' | 'rose';
}) {
  const colors = {
    violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    amber: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    blue: 'bg-blue-500/10 text-blue-700 dark:text-blue-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    slate: 'bg-slate-500/10 text-slate-700 dark:text-slate-300',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300'
  } satisfies Record<typeof tone, string>;

  return (
    <article className="rounded-3xl border border-border/60 bg-card/75 p-4 shadow-sm">
      <div className={cn('grid size-9 place-items-center rounded-xl [&_svg]:size-4', colors[tone])}>
        {icon}
      </div>
      <p className="mt-4 text-[9px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </article>
  );
}

function resolveDestinationValue(asset?: StoreStudioAdminAsset): string {
  if (asset?.productId) {
    return `product:${asset.productId}`;
  }
  if (asset?.promotionId) {
    return `promotion:${asset.promotionId}`;
  }
  if (asset?.collectionId) {
    return `collection:${asset.collectionId}`;
  }
  return '';
}

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 16);
}

function formatSchedule(campaign: StoreStudioAdminCampaign): string {
  if (!campaign.startsAt && !campaign.endsAt) {
    return 'No schedule limit';
  }

  const formatter = new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  if (campaign.startsAt && campaign.endsAt) {
    return `${formatter.format(new Date(campaign.startsAt))} – ${formatter.format(new Date(campaign.endsAt))}`;
  }

  if (campaign.startsAt) {
    return `Starts ${formatter.format(new Date(campaign.startsAt))}`;
  }

  return `Ends ${formatter.format(new Date(campaign.endsAt as string))}`;
}

'use client';

import { FileImage, FileVideo2, ImagePlus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { MediaQuickUploader } from '@/features/admin/media';
import { cn } from '@/lib/utils';
import type { StoreStudioAdminMediaAsset } from './storeStudioAdminTypes';

type Role = 'primary' | 'mobile' | 'poster' | 'cover';

const roleLabels: Record<Role, string> = {
  primary: 'Primary',
  mobile: 'Mobile',
  poster: 'Poster',
  cover: 'Cover'
};

function mediaPurpose(campaignType?: 'banner' | 'story' | 'reel') {
  if (campaignType === 'banner') return 'banners' as const;
  if (campaignType === 'story') return 'stories' as const;
  if (campaignType === 'reel') return 'reels' as const;
  return 'general' as const;
}

function roleAccept(role: Role, campaignType?: 'banner' | 'story' | 'reel') {
  if (role === 'poster' || role === 'cover') return 'image' as const;
  if (role === 'primary' && campaignType === 'reel') return 'video' as const;
  return 'image-and-video' as const;
}

function assetMatchesRole(
  asset: StoreStudioAdminMediaAsset,
  role: Role,
  campaignType?: 'banner' | 'story' | 'reel'
) {
  if (role === 'poster' || role === 'cover') return asset.resourceType === 'image';
  if (role === 'primary' && campaignType === 'reel') return asset.resourceType === 'video';
  return true;
}

export function StoreStudioMediaSelector({
  media,
  campaignType,
  initial,
  apiBasePath = '/api/admin/media'
}: {
  media: StoreStudioAdminMediaAsset[];
  campaignType?: 'banner' | 'story' | 'reel';
  initial?: {
    mediaAssetId: string | null;
    mobileMediaAssetId: string | null;
    posterMediaAssetId: string | null;
    coverMediaAssetId: string | null;
  };
  apiBasePath?: string;
}) {
  const [role, setRole] = useState<Role>('primary');
  const [assets, setAssets] = useState(media);
  const [selection, setSelection] = useState<Record<Role, string | null>>({
    primary: initial?.mediaAssetId ?? null,
    mobile: initial?.mobileMediaAssetId ?? null,
    poster: initial?.posterMediaAssetId ?? null,
    cover: initial?.coverMediaAssetId ?? null
  });

  const filtered = useMemo(
    () => assets.filter(asset => assetMatchesRole(asset, role, campaignType)),
    [assets, campaignType, role]
  );

  return (
    <section className="rounded-3xl border border-border/60 bg-muted/20 p-4">
      <input type="hidden" name="mediaAssetId" value={selection.primary ?? ''} />
      <input type="hidden" name="mobileMediaAssetId" value={selection.mobile ?? ''} />
      <input type="hidden" name="posterMediaAssetId" value={selection.poster ?? ''} />
      <input type="hidden" name="coverMediaAssetId" value={selection.cover ?? ''} />

      <div className="flex items-start gap-3">
        <span className="grid size-9 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ImagePlus className="size-4" />
        </span>
        <div>
          <p className="text-xs font-black">Workspace media gallery</p>
          <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
            Upload new media or assign an existing asset to each role. Reels require video as primary media; cover and poster roles use images.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(Object.keys(roleLabels) as Role[]).map(value => (
          <button
            key={value}
            type="button"
            onClick={() => setRole(value)}
            className={cn(
              'rounded-full px-3 py-2 text-[9px] font-bold',
              role === value
                ? 'bg-foreground text-background'
                : 'bg-background text-muted-foreground'
            )}
          >
            {roleLabels[value]}
            {selection[value] ? ' ✓' : ''}
          </button>
        ))}

        {selection[role] ? (
          <button
            type="button"
            onClick={() => setSelection(current => ({ ...current, [role]: null }))}
            className="rounded-full border border-border px-3 py-2 text-[9px] font-bold"
          >
            Clear {roleLabels[role]}
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        <MediaQuickUploader
          apiBasePath={apiBasePath}
          purpose={mediaPurpose(campaignType)}
          accept={roleAccept(role, campaignType)}
          multiple={false}
          compact
          onUploaded={uploaded => {
            const next: StoreStudioAdminMediaAsset = {
              id: uploaded.id,
              secureUrl: uploaded.secureUrl,
              resourceType: uploaded.resourceType === 'VIDEO' ? 'video' : 'image',
              displayName: uploaded.displayName,
              originalFilename: uploaded.originalFilename
            };

            if (!assetMatchesRole(next, role, campaignType)) return;
            setAssets(current => [next, ...current.filter(item => item.id !== next.id)]);
            setSelection(current => ({ ...current, [role]: next.id }));
          }}
        />
      </div>

      <div className="mt-4 grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1 sm:grid-cols-4 lg:grid-cols-5">
        {filtered.map(asset => {
          const selected = selection[role] === asset.id;

          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => setSelection(current => ({ ...current, [role]: asset.id }))}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-2xl border transition',
                selected
                  ? 'border-primary ring-2 ring-primary/25'
                  : 'border-border/60 opacity-75 hover:opacity-100'
              )}
            >
              {asset.resourceType === 'video' ? (
                <video
                  src={asset.secureUrl}
                  muted
                  playsInline
                  preload="metadata"
                  className="size-full object-cover"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={asset.secureUrl} alt="" className="size-full object-cover" />
              )}

              <span className="absolute left-1.5 top-1.5 grid size-6 place-items-center rounded-lg bg-black/55 text-white">
                {asset.resourceType === 'video' ? (
                  <FileVideo2 className="size-3" />
                ) : (
                  <FileImage className="size-3" />
                )}
              </span>

              {selected ? (
                <span className="absolute inset-x-1.5 bottom-1.5 rounded-lg bg-primary px-1.5 py-1 text-[7px] font-black text-primary-foreground">
                  {roleLabels[role].toUpperCase()}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {!filtered.length ? (
        <p className="mt-4 rounded-2xl border border-dashed border-border p-4 text-center text-[10px] text-muted-foreground">
          No suitable media is available for this role. Upload it above or through Media Studio.
        </p>
      ) : null}
    </section>
  );
}

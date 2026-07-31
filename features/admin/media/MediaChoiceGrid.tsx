'use client';

import { FileImage, FileVideo2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  StudioMediaCropDialog,
  mergeStudioCropRecipeMetadata
} from '@/features/studio-controls';
import type { StudioCropPurpose } from '@/features/studio-controls';
import { cn } from '@/lib/utils';
import { MediaQuickUploader } from './MediaQuickUploader';
import type {
  StudioMediaAccept,
  StudioMediaAsset,
  StudioMediaPurpose,
  StudioMediaResourceType
} from './mediaUploadClient';

export type MediaChoiceAsset = StudioMediaAsset;

function cropPurposeForMediaPurpose(purpose: StudioMediaPurpose): StudioCropPurpose {
  if (purpose === 'products') return 'product-square';
  if (purpose === 'banners') return 'banner-desktop';
  if (purpose === 'stories') return 'story';
  if (purpose === 'reels') return 'reel-cover';
  if (purpose === 'collections') return 'collection-cover';
  if (purpose === 'promotions') return 'promotion-banner';
  return 'product-gallery';
}

function isAccepted(
  asset: MediaChoiceAsset,
  acceptedResourceTypes: StudioMediaResourceType[]
): boolean {
  return acceptedResourceTypes.includes(asset.resourceType);
}

export function MediaChoiceGrid({
  media,
  name,
  multiple = false,
  initialIds = [],
  emptyLabel = 'No media selected',
  apiBasePath = '/api/admin/media',
  purpose = 'general',
  canUpload = true,
  uploadAccept = 'image-and-video',
  acceptedResourceTypes = ['IMAGE', 'VIDEO'],
  cropPurpose,
  autoSelectUploaded = true,
  onSelectionChange,
  onAssetUploaded
}: {
  media: MediaChoiceAsset[];
  name: string;
  multiple?: boolean;
  initialIds?: string[];
  emptyLabel?: string;
  apiBasePath?: string;
  purpose?: StudioMediaPurpose;
  canUpload?: boolean;
  uploadAccept?: StudioMediaAccept;
  acceptedResourceTypes?: StudioMediaResourceType[];
  cropPurpose?: StudioCropPurpose;
  autoSelectUploaded?: boolean;
  onSelectionChange?: (ids: string[]) => void;
  onAssetUploaded?: (asset: MediaChoiceAsset) => void;
}) {
  const [assets, setAssets] = useState<MediaChoiceAsset[]>(media);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    multiple ? Array.from(new Set(initialIds)) : initialIds.slice(0, 1)
  );
  const [query, setQuery] = useState('');
  const selectedIdsRef = useRef(selectedIds);

  useEffect(() => {
    setAssets(current => {
      const incomingIds = new Set(media.map(asset => asset.id));
      const locallyAdded = current.filter(asset => !incomingIds.has(asset.id));

      return [...media, ...locallyAdded];
    });
  }, [media]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return assets.filter(asset => {
      if (!isAccepted(asset, acceptedResourceTypes)) return false;
      if (!normalized) return true;

      return [asset.displayName, asset.originalFilename, asset.format, asset.id]
        .filter(Boolean)
        .some(value => String(value).toLowerCase().includes(normalized));
    });
  }, [acceptedResourceTypes, assets, query]);

  const updateSelection = (next: string[]) => {
    selectedIdsRef.current = next;
    setSelectedIds(next);
    onSelectionChange?.(next);
  };

  const select = (id: string) => {
    const current = selectedIdsRef.current;
    const next = !multiple
      ? current[0] === id
        ? []
        : [id]
      : current.includes(id)
        ? current.filter(selectedId => selectedId !== id)
        : [...current, id];

    updateSelection(next);
  };

  const onUploaded = (asset: MediaChoiceAsset) => {
    if (!isAccepted(asset, acceptedResourceTypes)) return;

    setAssets(current => [asset, ...current.filter(item => item.id !== asset.id)]);

    onAssetUploaded?.(asset);

    if (autoSelectUploaded) {
      const next = multiple
        ? Array.from(new Set([...selectedIdsRef.current, asset.id]))
        : [asset.id];

      updateSelection(next);
    }
  };

  return (
    <div className="space-y-3">
      {selectedIds.map(id => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      {canUpload ? (
        <MediaQuickUploader
          apiBasePath={apiBasePath}
          purpose={purpose}
          accept={uploadAccept}
          multiple={multiple}
          compact
          onUploaded={onUploaded}
        />
      ) : null}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search the available media gallery"
          className="h-10 w-full rounded-2xl border border-border/70 bg-background pl-9 pr-3 text-[10px] outline-none focus:border-primary"
        />
      </div>

      {!multiple ? (
        <button
          type="button"
          onClick={() => updateSelection([])}
          className={cn(
            'flex w-full items-center justify-between rounded-2xl border border-dashed px-4 py-3 text-left text-[10px] font-bold transition',
            selectedIds.length
              ? 'border-border/60 text-muted-foreground hover:bg-muted/40'
              : 'border-primary/50 bg-primary/5 text-primary'
          )}
        >
          <span>{emptyLabel}</span>
          {selectedIds.length ? <X className="size-3.5" /> : null}
        </button>
      ) : null}

      {filtered.length ? (
        <div className="grid max-h-[34rem] grid-cols-2 gap-3 overflow-y-auto rounded-3xl border border-border/60 bg-background/45 p-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map(asset => {
            const selected = selectedIds.includes(asset.id);

            return (
              <div
                key={asset.id}
                className={cn(
                  'group relative aspect-square overflow-hidden rounded-2xl border bg-muted text-left transition',
                  selected
                    ? 'border-primary ring-2 ring-primary/25'
                    : 'border-border/60 opacity-80 hover:opacity-100'
                )}
              >
                <button type="button" onClick={() => select(asset.id)} aria-pressed={selected} className="absolute inset-0 z-0">
                  <span className="sr-only">Select {asset.displayName ?? asset.originalFilename ?? asset.id}</span>
                </button>
                {asset.resourceType === 'VIDEO' ? (
                  <video src={asset.secureUrl} muted playsInline preload="metadata" className="pointer-events-none size-full object-cover" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={asset.secureUrl} alt="" className="pointer-events-none size-full object-cover" />
                )}
                <span className="pointer-events-none absolute left-2 top-2 grid size-7 place-items-center rounded-xl bg-black/55 text-white backdrop-blur-md">
                  {asset.resourceType === 'VIDEO' ? <FileVideo2 className="size-3.5" /> : <FileImage className="size-3.5" />}
                </span>
                {asset.resourceType === 'IMAGE' ? (
                  <span className="absolute right-2 top-2 z-10">
                    <StudioMediaCropDialog
                      assetId={asset.id}
                      imageUrl={asset.secureUrl}
                      metadata={asset.metadata}
                      apiBasePath={apiBasePath}
                      initialPurpose={cropPurpose ?? cropPurposeForMediaPurpose(purpose)}
                      compact
                      onSaved={recipe => {
                        setAssets(current =>
                          current.map(item =>
                            item.id === asset.id
                              ? {
                                  ...item,
                                  metadata: mergeStudioCropRecipeMetadata(
                                    item.metadata,
                                    recipe
                                  )
                                }
                              : item
                          )
                        );
                      }}
                    />
                  </span>
                ) : null}
                <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/70 px-2 py-1.5 text-[8px] font-bold text-white">{asset.displayName ?? asset.originalFilename ?? asset.id}</span>
                {selected ? <span className="pointer-events-none absolute left-2 top-11 rounded-full bg-primary px-2 py-1 text-[7px] font-black text-primary-foreground">SELECTED</span> : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border/70 p-6 text-center text-xs text-muted-foreground">
          {assets.length
            ? 'No media matches the current search or file requirements.'
            : 'Upload media here or in Media Studio to begin the gallery.'}
        </div>
      )}
    </div>
  );
}

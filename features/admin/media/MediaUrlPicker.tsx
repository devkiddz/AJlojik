'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import type { StudioCropPurpose } from '@/features/studio-controls';
import { cn } from '@/lib/utils';

import { MediaChoiceGrid, type MediaChoiceAsset } from './MediaChoiceGrid';
import type {
  StudioMediaAccept,
  StudioMediaPurpose,
  StudioMediaResourceType
} from './mediaUploadClient';

export function MediaUrlPicker({
  media,
  name,
  initialUrls = [],
  multiple = false,
  purpose = 'general',
  emptyLabel = 'No Media Studio asset selected',
  manualLabel = 'Manual or external URL',
  acceptedResourceTypes = ['IMAGE'],
  uploadAccept = 'image',
  cropPurpose,
  onUrlsChange
}: {
  media: MediaChoiceAsset[];
  name: string;
  initialUrls?: string[];
  multiple?: boolean;
  purpose?: StudioMediaPurpose;
  emptyLabel?: string;
  manualLabel?: string;
  acceptedResourceTypes?: StudioMediaResourceType[];
  uploadAccept?: StudioMediaAccept;
  cropPurpose?: StudioCropPurpose;
  onUrlsChange?: (urls: string[]) => void;
}) {
  const initialIds = useMemo(() => {
    const urls = new Set(initialUrls.filter(Boolean));
    return media.filter(asset => urls.has(asset.secureUrl)).map(asset => asset.id);
  }, [initialUrls, media]);
  const unmatchedInitialUrls = useMemo(() => {
    const knownUrls = new Set(media.map(asset => asset.secureUrl));
    return initialUrls.filter(url => url && !knownUrls.has(url));
  }, [initialUrls, media]);
  const [assets, setAssets] = useState(media);
  const [selectedIds, setSelectedIds] = useState(initialIds);
  const [manualUrls, setManualUrls] = useState(unmatchedInitialUrls.join('\n'));
  const onUrlsChangeRef = useRef(onUrlsChange);

  useEffect(() => {
    onUrlsChangeRef.current = onUrlsChange;
  }, [onUrlsChange]);

  const selectedUrls = useMemo(
    () =>
      selectedIds
        .map(id => assets.find(asset => asset.id === id)?.secureUrl)
        .filter((url): url is string => Boolean(url)),
    [assets, selectedIds]
  );
  const resolvedManualUrls = useMemo(
    () =>
      manualUrls
        .split(/[\n,]+/)
        .map(value => value.trim())
        .filter(Boolean),
    [manualUrls]
  );
  const values = useMemo(
    () =>
      multiple
        ? Array.from(new Set([...selectedUrls, ...resolvedManualUrls]))
        : [selectedUrls[0] ?? resolvedManualUrls[0] ?? ''].filter(Boolean),
    [multiple, resolvedManualUrls, selectedUrls]
  );

  useEffect(() => {
    onUrlsChangeRef.current?.(values);
  }, [values]);

  return (
    <div className="space-y-3">
      {values.map(value => (
        <input key={value} type="hidden" name={name} value={value} />
      ))}

      <MediaChoiceGrid
        media={assets}
        name={`_${name}MediaAssetId`}
        multiple={multiple}
        initialIds={initialIds}
        emptyLabel={emptyLabel}
        purpose={purpose}
        uploadAccept={uploadAccept}
        acceptedResourceTypes={acceptedResourceTypes}
        cropPurpose={cropPurpose}
        onSelectionChange={setSelectedIds}
        onAssetUploaded={asset =>
          setAssets(current => [asset, ...current.filter(item => item.id !== asset.id)])
        }
      />

      <label className="block">
        <span className="mb-2 block text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">
          {manualLabel}
        </span>
        {multiple ? (
          <textarea
            rows={3}
            value={manualUrls}
            onChange={event => setManualUrls(event.target.value)}
            placeholder="One external URL per line"
            className={cn(
              'w-full rounded-2xl border border-border/70 bg-background px-3 py-2 text-xs outline-none focus:border-primary'
            )}
          />
        ) : (
          <input
            value={manualUrls}
            onChange={event => setManualUrls(event.target.value)}
            placeholder="Optional external or legacy URL"
            className="h-11 w-full rounded-2xl border border-border/70 bg-background px-3 text-xs outline-none focus:border-primary"
          />
        )}
      </label>
    </div>
  );
}

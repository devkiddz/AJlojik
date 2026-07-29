'use client';

import { CheckCircle2, LoaderCircle, UploadCloud, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';
import {
  type StudioMediaAccept,
  type StudioMediaAsset,
  type StudioMediaPurpose,
  uploadStudioMediaFile,
  validateStudioMediaFile
} from './mediaUploadClient';

type UploadRow = {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'complete' | 'failed';
  error?: string;
};

function inputAccept(accept: StudioMediaAccept): string {
  if (accept === 'image') return 'image/*';
  if (accept === 'video') return 'video/*';
  return 'image/*,video/*';
}

export function MediaQuickUploader({
  apiBasePath = '/api/admin/media',
  purpose,
  accept = 'image-and-video',
  multiple = true,
  disabled = false,
  compact = false,
  onUploaded
}: {
  apiBasePath?: string;
  purpose: StudioMediaPurpose;
  accept?: StudioMediaAccept;
  multiple?: boolean;
  disabled?: boolean;
  compact?: boolean;
  onUploaded: (asset: StudioMediaAsset) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<UploadRow[]>([]);
  const [dragging, setDragging] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const updateRow = (id: string, patch: Partial<UploadRow>) => {
    setRows(current => current.map(row => (row.id === id ? { ...row, ...patch } : row)));
  };

  const processFiles = async (fileList: FileList | File[]) => {
    if (disabled) return;

    const selected = Array.from(fileList);
    const accepted = multiple ? selected : selected.slice(0, 1);
    const valid: File[] = [];
    const validationMessages: string[] = [];

    for (const file of accepted) {
      const error = validateStudioMediaFile(file, accept);
      if (error) validationMessages.push(error);
      else valid.push(file);
    }

    setMessage(validationMessages.length ? validationMessages.join(' ') : null);

    const initialRows = valid.map(file => ({
      id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
      name: file.name,
      progress: 0,
      status: 'uploading' as const
    }));

    setRows(current => [...initialRows, ...current].slice(0, 8));

    for (const [index, file] of valid.entries()) {
      const row = initialRows[index];

      try {
        const asset = await uploadStudioMediaFile({
          file,
          apiBasePath,
          purpose,
          accept,
          onProgress: progress => updateRow(row.id, { progress })
        });

        updateRow(row.id, { status: 'complete', progress: 100 });
        onUploaded(asset);
      } catch (error) {
        updateRow(row.id, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Upload failed.'
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={event => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragOver={event => event.preventDefault()}
        onDragLeave={event => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
        }}
        onDrop={event => {
          event.preventDefault();
          setDragging(false);
          void processFiles(event.dataTransfer.files);
        }}
        className={cn(
          'w-full rounded-2xl border border-dashed text-center transition',
          compact ? 'min-h-20 px-4 py-3' : 'min-h-28 px-5 py-5',
          dragging ? 'border-primary bg-primary/10' : 'border-border/70 bg-background/55 hover:border-primary/40 hover:bg-muted/40',
          disabled && 'cursor-not-allowed opacity-45'
        )}
      >
        <UploadCloud className={cn('mx-auto text-primary', compact ? 'size-5' : 'size-7')} />
        <p className="mt-2 text-xs font-black">Upload {multiple ? 'media gallery' : 'media'}</p>
        <p className="mt-1 text-[9px] leading-4 text-muted-foreground">
          Drop {accept === 'image' ? 'images' : accept === 'video' ? 'videos' : 'images or videos'} here, or click to browse.
        </p>
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple={multiple}
        accept={inputAccept(accept)}
        className="hidden"
        onChange={event => {
          if (event.target.files) void processFiles(event.target.files);
          event.target.value = '';
        }}
      />

      {message ? <p className="rounded-2xl bg-amber-500/10 p-3 text-[10px] leading-4 text-amber-700">{message}</p> : null}

      {rows.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {rows.map(row => (
            <div key={row.id} className="rounded-2xl border border-border/60 bg-background/65 p-3">
              <div className="flex items-center gap-2">
                {row.status === 'complete' ? (
                  <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                ) : row.status === 'failed' ? (
                  <XCircle className="size-4 shrink-0 text-rose-500" />
                ) : (
                  <LoaderCircle className="size-4 shrink-0 animate-spin text-primary" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[9px] font-bold">{row.name}</p>
                  <p className="mt-0.5 truncate text-[8px] text-muted-foreground">{row.error ?? row.status}</p>
                </div>
                <span className="text-[8px] font-bold">{row.progress}%</span>
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                <div className="h-full bg-primary transition-all" style={{ width: `${row.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

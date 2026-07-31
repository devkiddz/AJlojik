'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState, type ReactNode } from 'react';
import {
  BadgePercent,
  CakeSlice,
  Grid2X2Plus,
  LayoutGrid,
  Logs,
  PartyPopper,
  Save,
  Sparkles,
  UtensilsCrossed,
  Wine
} from 'lucide-react';

import { adminFieldClass } from '@/features/admin/components';
import {
  MediaUrlPicker,
  type MediaChoiceAsset
} from '@/features/admin/media';
import { StudioSelectField } from '@/features/studio-controls';
import { cn } from '@/lib/utils';

import { saveCategory } from './actions';

export type CategoryComposerValue = {
  id: string;
  label: string;
  slug: string;
  iconName: string | null;
  image: string | null;
  coverImages: string[];
  shortDescription: string | null;
  description: string | null;
  accentColor: string | null;
  className: string | null;
  active: boolean;
  position: number;
};

const iconOptions = [
  { value: 'Logs', label: 'All products', icon: Logs },
  { value: 'LayoutGrid', label: 'General category', icon: LayoutGrid },
  { value: 'Wine', label: 'Wine and drinks', icon: Wine },
  { value: 'UtensilsCrossed', label: 'Kitchen and meals', icon: UtensilsCrossed },
  { value: 'CakeSlice', label: 'Confectioneries', icon: CakeSlice },
  { value: 'PartyPopper', label: 'Party plans', icon: PartyPopper },
  { value: 'BadgePercent', label: 'Deals', icon: BadgePercent },
  { value: 'Sparkles', label: 'Premium selection', icon: Sparkles }
] as const;

const iconMap = Object.fromEntries(iconOptions.map(option => [option.value, option.icon]));

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function CategoryComposer({
  editing,
  media
}: {
  editing: CategoryComposerValue | null;
  media: MediaChoiceAsset[];
}) {
  const [label, setLabel] = useState(editing?.label ?? '');
  const [slug, setSlug] = useState(editing?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(editing?.slug));
  const [iconName, setIconName] = useState(editing?.iconName ?? 'LayoutGrid');
  const [image, setImage] = useState(editing?.image ?? '');
  const [coverImages, setCoverImages] = useState(editing?.coverImages.join('\n') ?? '');
  const [shortDescription, setShortDescription] = useState(editing?.shortDescription ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [accentColor, setAccentColor] = useState(editing?.accentColor ?? '#7c3aed');
  const [position, setPosition] = useState(String(editing?.position ?? 0));
  const [active, setActive] = useState(editing?.active ?? true);

  const PreviewIcon = useMemo(() => iconMap[iconName] ?? Grid2X2Plus, [iconName]);
  const previewImage = image.trim() || coverImages.split(/[\n,]+/).map(item => item.trim()).find(Boolean) || '';

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.88fr)]">
      <form action={saveCategory} className="grid gap-4 sm:grid-cols-2">
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <Field label="Category label">
          <input
            name="label"
            value={label}
            onChange={event => {
              const nextLabel = event.target.value;
              setLabel(nextLabel);
              if (!slugEdited) setSlug(makeSlug(nextLabel));
            }}
            required
            className={adminFieldClass}
          />
        </Field>

        <Field label="Slug">
          <input
            name="slug"
            value={slug}
            onChange={event => {
              setSlugEdited(true);
              setSlug(makeSlug(event.target.value));
            }}
            required
            className={adminFieldClass}
          />
        </Field>

        <Field label="Icon">
          <StudioSelectField
            name="iconName"
            value={iconName}
            onValueChange={setIconName}
            options={iconOptions.map(option => ({
              value: option.value,
              label: option.label
            }))}
          />
        </Field>

        <Field label="Position">
          <input name="position" type="number" value={position} onChange={event => setPosition(event.target.value)} className={adminFieldClass} />
        </Field>

        <Field label="Accent colour">
          <div className="grid grid-cols-[3rem_1fr] gap-2">
            <input
              type="color"
              value={accentColor || '#7c3aed'}
              onChange={event => setAccentColor(event.target.value)}
              className="h-[2.875rem] w-full rounded-2xl border border-border/70 bg-background p-1"
              aria-label="Choose category accent colour"
            />
            <input name="accentColor" value={accentColor} onChange={event => setAccentColor(event.target.value)} className={adminFieldClass} />
          </div>
        </Field>

        <Field label="Optional utility class">
          <input name="className" defaultValue={editing?.className ?? ''} placeholder="e.g. category-wines" className={adminFieldClass} />
        </Field>

        <Field label="Primary category media" className="sm:col-span-2">
          <MediaUrlPicker
            media={media}
            name="image"
            initialUrls={image ? [image] : []}
            purpose="collections"
            cropPurpose="category-cover"
            emptyLabel="No primary category image"
            manualLabel="Legacy or external primary image URL"
            onUrlsChange={urls => setImage(urls[0] ?? '')}
          />
        </Field>

        <Field label="Category cover gallery" className="sm:col-span-2">
          <MediaUrlPicker
            media={media}
            name="coverImages"
            initialUrls={coverImages
              .split(/[\n,]+/)
              .map(value => value.trim())
              .filter(Boolean)}
            multiple
            purpose="collections"
            cropPurpose="category-cover"
            emptyLabel="No category cover images"
            manualLabel="Additional external cover URLs"
            onUrlsChange={urls => setCoverImages(urls.join('\n'))}
          />
        </Field>

        <Field label="Short description" className="sm:col-span-2">
          <input name="shortDescription" value={shortDescription} onChange={event => setShortDescription(event.target.value)} className={adminFieldClass} />
        </Field>

        <Field label="Full description" className="sm:col-span-2">
          <textarea
            name="description"
            rows={5}
            value={description}
            onChange={event => setDescription(event.target.value)}
            className={cn(adminFieldClass, 'h-auto py-3')}
          />
        </Field>

        <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border/60 bg-background/60 px-4 text-sm font-bold sm:col-span-2">
          <input name="active" type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} />
          Visible in the customer Store
        </label>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-5 font-bold text-background">
            <Save className="size-4" />
            {editing ? 'Save category' : 'Create category'}
          </button>

          {editing ? (
            <Link href="/admin/categories" className="inline-flex h-12 items-center rounded-full px-5 font-bold text-muted-foreground">
              Cancel editing
            </Link>
          ) : null}
        </div>
      </form>

      <aside className="self-start xl:sticky xl:top-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/70">Live composer preview</p>
        <div className="mt-3 overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-xl">
          <div className="relative aspect-[16/9] overflow-hidden bg-muted">
            {previewImage ? (
              <Image src={previewImage} alt="" fill sizes="520px" className="object-cover" />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
            <div className="absolute left-4 top-4 grid size-11 place-items-center rounded-2xl border border-white/20 bg-black/35 text-white backdrop-blur-xl">
              <PreviewIcon className="size-5" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-bold" style={{ backgroundColor: accentColor || '#7c3aed' }}>
                {active ? 'Active category' : 'Hidden category'}
              </span>
              <h3 className="mt-3 text-2xl font-black">{label || 'Category name'}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/75">
                {shortDescription || description || 'Add a short customer-facing category description.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5 text-sm">
            <div className="rounded-2xl bg-muted/55 p-3">
              <p className="text-xs text-muted-foreground">Route</p>
              <p className="mt-1 truncate font-bold">/store?category={slug || 'category'}</p>
            </div>
            <div className="rounded-2xl bg-muted/55 p-3">
              <p className="text-xs text-muted-foreground">Order</p>
              <p className="mt-1 font-bold">{position || '0'}</p>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

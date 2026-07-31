'use client';

import Link from 'next/link';
import { Save, Tags } from 'lucide-react';
import { useState, type ReactNode } from 'react';

import { adminFieldClass } from '@/features/admin/components';
import {
  MediaUrlPicker,
  type MediaChoiceAsset
} from '@/features/admin/media';
import { cn } from '@/lib/utils';

import { saveBrand } from './actions';

export type BrandComposerValue = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  image: string | null;
  active: boolean;
};

function makeSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function BrandComposer({
  editing,
  media
}: {
  editing: BrandComposerValue | null;
  media: MediaChoiceAsset[];
}) {
  const [name, setName] = useState(editing?.name ?? '');
  const [slug, setSlug] = useState(editing?.slug ?? '');
  const [slugEdited, setSlugEdited] = useState(Boolean(editing?.slug));
  const [description, setDescription] = useState(editing?.description ?? '');
  const [logo, setLogo] = useState(editing?.logo ?? '');
  const [image, setImage] = useState(editing?.image ?? '');
  const [active, setActive] = useState(editing?.active ?? true);
  const previewImage = image.trim() || logo.trim();

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]">
      <form action={saveBrand} className="grid gap-4 sm:grid-cols-2">
        {editing ? <input type="hidden" name="id" value={editing.id} /> : null}

        <Field label="Brand name">
          <input
            name="name"
            value={name}
            onChange={event => {
              const nextName = event.target.value;
              setName(nextName);
              if (!slugEdited) setSlug(makeSlug(nextName));
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

        <Field label="Brand logo" className="sm:col-span-2">
          <MediaUrlPicker
            media={media}
            name="logo"
            initialUrls={logo ? [logo] : []}
            purpose="general"
            cropPurpose="brand-cover"
            emptyLabel="No brand logo selected"
            manualLabel="Legacy or external logo URL"
            onUrlsChange={urls => setLogo(urls[0] ?? '')}
          />
        </Field>

        <Field label="Brand cover image" className="sm:col-span-2">
          <MediaUrlPicker
            media={media}
            name="image"
            initialUrls={image ? [image] : []}
            purpose="banners"
            cropPurpose="brand-cover"
            emptyLabel="No brand cover selected"
            manualLabel="Legacy or external cover URL"
            onUrlsChange={urls => setImage(urls[0] ?? '')}
          />
        </Field>

        <Field label="Description" className="sm:col-span-2">
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
          Available for product assignment
        </label>

        <div className="flex flex-wrap gap-3 sm:col-span-2">
          <button className="inline-flex h-12 items-center gap-2 rounded-full bg-foreground px-5 font-bold text-background">
            <Save className="size-4" />
            {editing ? 'Save brand' : 'Create brand'}
          </button>
          {editing ? (
            <Link href="/admin/brands" className="inline-flex h-12 items-center rounded-full px-5 font-bold text-muted-foreground">
              Cancel editing
            </Link>
          ) : null}
        </div>
      </form>

      <aside className="self-start xl:sticky xl:top-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-primary/70">Brand preview</p>
        <article className="mt-3 overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-xl">
          <div className="relative aspect-[16/9] overflow-hidden bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.2),transparent_55%)]">
            {previewImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewImage} alt="" className="size-full object-cover" />
            ) : (
              <div className="grid size-full place-items-center">
                <Tags className="size-12 text-muted-foreground/40" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/15 to-transparent" />
            {logo && image ? (
              <span className="absolute left-4 top-4 grid size-14 place-items-center overflow-hidden rounded-2xl border border-white/25 bg-white/90 p-2 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo} alt="" className="size-full object-contain" />
              </span>
            ) : null}
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold backdrop-blur-xl">
                {active ? 'Active brand' : 'Inactive brand'}
              </span>
              <h3 className="mt-3 text-2xl font-black">{name || 'Brand name'}</h3>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-white/75">
                {description || 'Add a customer-facing brand description.'}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5 text-sm">
            <div className="rounded-2xl bg-muted/55 p-3">
              <p className="text-xs text-muted-foreground">Catalog slug</p>
              <p className="mt-1 truncate font-bold">{slug || 'brand-slug'}</p>
            </div>
            <div className="rounded-2xl bg-muted/55 p-3">
              <p className="text-xs text-muted-foreground">Availability</p>
              <p className="mt-1 font-bold">{active ? 'Assignable' : 'Hidden'}</p>
            </div>
          </div>
        </article>
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

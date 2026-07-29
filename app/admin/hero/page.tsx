import Link from 'next/link';
import {
  ArrowLeft,
  ImageIcon,
  Save,
  ShieldCheck,
  Video
} from 'lucide-react';

import HeroBackgroundMedia from '@/components/home/HeroBackgroundMedia';
import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { updateStorefrontHero } from '@/features/admin/hero/actions';
import { MediaChoiceGrid } from '@/features/admin/media/MediaChoiceGrid';
import { prisma } from '@/lib/prisma';

const fallbackVideo = 'https://www.youtube.com/watch?v=WN_fa23hasc';
const fallbackImage =
  'https://images.unsplash.com/photo-1575444758702-4a6b9222336e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
const inputClass =
  'min-h-11 w-full rounded-2xl border border-border/70 bg-background/75 px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10';

export default async function AdminHeroPage() {
  const access = await requireAdminPermission('system:manage');
  const workspaceId = access.membership.workspaceId;

  const [hero, media] = await Promise.all([
    prisma.storefrontHero
      .findUnique({ where: { workspaceId } })
      .catch(() => null),
    prisma.mediaAsset.findMany({
      where: {
        workspaceId,
        vendorProfileId: null,
        status: 'ACTIVE',
        resourceType: { in: ['IMAGE', 'VIDEO'] }
      },
      select: {
        id: true,
        secureUrl: true,
        resourceType: true,
        displayName: true,
        originalFilename: true,
        format: true,
        width: true,
        height: true,
        duration: true,
        bytes: true
      },
      orderBy: { createdAt: 'desc' },
      take: 250
    })
  ]);

  const mediaType = hero?.mediaType === 'IMAGE' ? 'IMAGE' : 'VIDEO';
  const mediaUrl = hero?.mediaUrl || fallbackVideo;
  const posterUrl = hero?.posterUrl || fallbackImage;

  return (
    <main className="min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/.1),transparent_35%)] px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-xl sm:p-7">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground"
          >
            <ArrowLeft className="size-4" /> Admin attention center
          </Link>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.2em] text-primary">
                Storefront studio
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">
                Homepage hero
              </h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                Control the cinematic media, onboarding message, and entry
                actions shown above the storefront.
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-[10px] font-bold text-emerald-600">
              <ShieldCheck className="size-4" /> Super Admin only
            </span>
          </div>
        </header>

        <form
          action={updateStorefrontHero}
          className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(25rem,.8fr)]"
        >
          <div className="space-y-5">
            <section className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6">
              <h2 className="font-black">Media treatment</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Upload or choose the primary hero media and poster from the
                workspace Media Studio. External links remain available only as
                an advanced fallback.
              </p>

              <fieldset className="mt-5">
                <legend className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
                  Background media gallery
                </legend>
                <MediaChoiceGrid
                  media={media}
                  name="mediaAssetId"
                  initialIds={hero?.mediaAssetId ? [hero.mediaAssetId] : []}
                  emptyLabel="No Media Studio background selected"
                  purpose="banners"
                  uploadAccept="image-and-video"
                  acceptedResourceTypes={['IMAGE', 'VIDEO']}
                />
              </fieldset>

              <fieldset className="mt-5">
                <legend className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
                  Poster and fallback gallery
                </legend>
                <MediaChoiceGrid
                  media={media}
                  name="posterMediaAssetId"
                  initialIds={
                    hero?.posterMediaAssetId ? [hero.posterMediaAssetId] : []
                  }
                  emptyLabel="No Media Studio poster selected"
                  purpose="banners"
                  uploadAccept="image"
                  acceptedResourceTypes={['IMAGE']}
                />
              </fieldset>

              <details className="mt-5 rounded-2xl border border-dashed border-border/70 p-4">
                <summary className="cursor-pointer text-[10px] font-bold text-muted-foreground">
                  Advanced external media fallback
                </summary>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="External media type">
                    <select
                      name="mediaType"
                      defaultValue={mediaType}
                      className={inputClass}
                    >
                      <option value="VIDEO">Video / YouTube</option>
                      <option value="IMAGE">Image</option>
                    </select>
                  </Field>

                  <Field label="External background media URL">
                    <input
                      name="mediaUrl"
                      type="url"
                      defaultValue={hero?.mediaAssetId ? '' : mediaUrl}
                      placeholder="Used only when no gallery media is selected"
                      className={inputClass}
                    />
                  </Field>
                </div>

                <Field label="External poster URL">
                  <input
                    name="posterUrl"
                    type="url"
                    defaultValue={hero?.posterMediaAssetId ? '' : posterUrl}
                    placeholder="Used only when no gallery poster is selected"
                    className={inputClass}
                  />
                </Field>
              </details>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Toggle
                  name="enabled"
                  label="Hero enabled"
                  defaultChecked={hero?.enabled ?? true}
                />
                <Toggle
                  name="autoplay"
                  label="Autoplay muted video"
                  defaultChecked={hero?.autoplay ?? true}
                />
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6">
              <h2 className="font-black">Onboarding story</h2>

              <div className="mt-5 space-y-4">
                <Field label="Eyebrow">
                  <input
                    name="eyebrow"
                    defaultValue={
                      hero?.eyebrow ?? 'Your personal shopping experience'
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Hero title">
                  <input
                    name="title"
                    required
                    defaultValue={
                      hero?.title ?? 'Every beautiful moment starts here.'
                    }
                    className={inputClass}
                  />
                </Field>

                <Field label="Summary">
                  <textarea
                    name="summary"
                    rows={4}
                    defaultValue={
                      hero?.summary ??
                      'Build shopping lists like playlists, discover elegant experiences shaped around your taste, and move every pick from inspiration to delivery in one personal hub.'
                    }
                    className={inputClass}
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Primary button label">
                    <input
                      name="primaryLabel"
                      defaultValue={
                        hero?.primaryLabel ?? 'Create your experience'
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Primary button link">
                    <input
                      name="primaryHref"
                      defaultValue={hero?.primaryHref ?? '/sign-up'}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Secondary button label">
                    <input
                      name="secondaryLabel"
                      defaultValue={hero?.secondaryLabel ?? 'Sign in'}
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Secondary button link">
                    <input
                      name="secondaryHref"
                      defaultValue={hero?.secondaryHref ?? '/sign-in'}
                      className={inputClass}
                    />
                  </Field>
                </div>
              </div>
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-[#03070d] text-white shadow-2xl">
              <div className="relative aspect-[4/3]">
                <HeroBackgroundMedia
                  mediaType={mediaType}
                  mediaUrl={mediaUrl}
                  fallbackImage={posterUrl}
                  autoplay={hero?.autoplay ?? true}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.18em] text-amber-300">
                      {hero?.eyebrow ?? 'Your personal shopping experience'}
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      {hero?.title ?? 'Every beautiful moment starts here.'}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-white/10 p-4 text-[10px] text-white/60">
                {mediaType === 'VIDEO' ? (
                  <Video className="size-4" />
                ) : (
                  <ImageIcon className="size-4" />
                )}
                Current saved preview
              </div>
            </section>

            <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-sm font-bold text-background shadow-lg">
              <Save className="size-4" /> Publish homepage hero
            </button>
          </aside>
        </form>
      </div>
    </main>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block">
      <span className="mb-2 block text-[10px] font-bold uppercase tracking-[.14em] text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  name,
  label,
  defaultChecked
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/55 p-3 text-xs font-bold">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} />
      {label}
    </label>
  );
}

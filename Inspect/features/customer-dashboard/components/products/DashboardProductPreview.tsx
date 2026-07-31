import Image from 'next/image';

import {
  ArrowUpRight,
  Heart,
  PackageCheck,
  Play,
  ShoppingBag,
  Star
} from 'lucide-react';

import {
  openCustomerProductExperience
} from '@/features/customer-experience';

import {
  cn
} from '@/lib/utils';

import type {
  CommerceProduct
} from '../../contracts/customerDashboardTypes';

export type DashboardProductSource =
  | 'suggested'
  | 'picked-for-you'
  | 'saved'
  | 'viewed'
  | 'restock';

type DashboardProductPreviewProps = {
  product: CommerceProduct;
  source: DashboardProductSource;

  position?: number;
  hasVideo?: boolean;
};

const moneyFormatter =
  new Intl.NumberFormat(
    'en-US',
    {
      style:
        'currency',

      currency:
        'NGN',

      maximumFractionDigits:
        0
    }
  );

const sourceLabels = {
  suggested: {
    label:
      'Match',

    icon:
      PackageCheck,

    className:
      'bg-sky-500/90 text-white'
  },

  'picked-for-you': {
    label:
      'For you',

    icon:
      Heart,

    className:
      'bg-violet-500/90 text-white'
  },

  saved: {
    label:
      'Saved',

    icon:
      Heart,

    className:
      'bg-rose-500/90 text-white'
  },

  viewed: {
    label:
      'Viewed',

    icon:
      Play,

    className:
      'bg-slate-950/80 text-white'
  },

  restock: {
    label:
      'Restock',

    icon:
      ShoppingBag,

    className:
      'bg-emerald-500/90 text-white'
  }
} satisfies Record<
  DashboardProductSource,
  {
    label: string;
    icon: typeof Heart;
    className: string;
  }
>;

export function DashboardProductPreview({
  product,
  source,
  position,
  hasVideo = false
}: DashboardProductPreviewProps) {
  const sourceLabel =
    sourceLabels[source];

  const SourceIcon =
    sourceLabel.icon;

  return (
    <button
      type="button"
      data-rail-item
      onClick={() =>
        openCustomerProductExperience({
          id:
            product.id,

          name:
            product.name
        })
      }
      aria-label={`Open ${product.name} in Discovery Hub`}
      className="
        group w-36 shrink-0
        snap-start overflow-hidden
        rounded-xl border
        border-border/60
        bg-background text-left
        shadow-sm transition
        duration-300

        hover:-translate-y-0.5
        hover:border-primary/25
        hover:shadow-md

        sm:w-40
        lg:w-44
      ">
      <div
        className="
          relative aspect-[4/5]
          overflow-hidden bg-muted
        ">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="
              (max-width: 640px) 144px,
              (max-width: 1024px) 160px,
              176px
            "
            className="
              object-cover
              transition duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="grid size-full place-items-center">
            <ShoppingBag className="size-5 text-muted-foreground" />
          </div>
        )}

        <div
          className="
            absolute inset-x-0 bottom-0
            h-20 bg-gradient-to-t
            from-black/60 via-black/15
            to-transparent
          "
        />

        <span
          className={cn(
            `
              absolute left-2 top-2
              inline-flex items-center
              gap-1 rounded-md
              px-1.5 py-1
              text-[10px] font-bold
              shadow-sm backdrop-blur
            `,
            sourceLabel.className
          )}>
          <SourceIcon className="size-3" />

          {sourceLabel.label}
        </span>

        {position ? (
          <span
            className="
              absolute bottom-2 left-2
              rounded-md bg-black/45
              px-1.5 py-1
              text-[10px] font-bold
              text-white backdrop-blur
            ">
            {String(position).padStart(
              2,
              '0'
            )}
          </span>
        ) : null}

        {hasVideo ? (
          <span
            aria-label="Video preview available"
            className="
              absolute bottom-2 right-2
              grid size-7 place-items-center
              rounded-full bg-white/90
              text-slate-950 shadow-sm
              backdrop-blur
            ">
            <Play className="ml-0.5 size-3 fill-current" />
          </span>
        ) : (
          <span
            className="
              absolute bottom-2 right-2
              grid size-7 place-items-center
              rounded-lg bg-white/90
              text-slate-950 shadow-sm
              backdrop-blur
            ">
            <ArrowUpRight className="size-3.5" />
          </span>
        )}
      </div>

      <div className="p-2.5">
        <p
          className="
            line-clamp-2 min-h-8
            break-words text-xs
            font-semibold leading-4
          ">
          {product.name}
        </p>

        <div className="mt-2 flex items-end justify-between gap-2">
          <span
            className="
              min-w-0 truncate
              text-xs font-bold
            ">
            {moneyFormatter.format(
              product.price
            )}
          </span>

          <span
            className="
              flex shrink-0
              items-center gap-1
              text-[11px] font-semibold
              text-muted-foreground
            ">
            <Star className="size-3 fill-current text-amber-500" />

            {product.rating.toFixed(
              1
            )}
          </span>
        </div>
      </div>
    </button>
  );
}

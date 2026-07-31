'use client';

import {
  ArrowRight,
  BrainCircuit,
  Sparkles,
  UtensilsCrossed
} from 'lucide-react';

import {
  useRouter
} from 'next/navigation';

import {
  useFeedExperience
} from '@/features/feed-experience';

type AiEntryMode =
  | 'suggestions'
  | 'pairing';

function AiEntryWidget({
  mode
}: {
  mode: AiEntryMode;
}) {
  const router =
    useRouter();

  const {
    intent,
    context
  } = useFeedExperience();

  const title =
    mode ===
    'pairing'
      ? 'Pairing Assistant'
      : 'AJ AI Suggestions';

  const description =
    mode ===
    'pairing'
      ? 'Prepare product and category context for future drink, meal and treat pairing assistance.'
      : 'Carry the current shopping intent into the customer AI foundation without pretending a model response already exists.';

  const openAssistant =
    () => {
      const query =
        new URLSearchParams({
          mode,

          source:
            'discovery-hub',

          intent:
            intent.type,

          surface:
            intent.surface ??
            'customer',

          recent:
            String(
              context.user
                .recentProductIds
                .length
            ),

          saved:
            String(
              context.user
                .wishlistProductIds
                .length
            )
        });

      if (
        intent.targetId
      ) {
        query.set(
          'productId',
          intent.targetId
        );
      }

      if (
        intent.categorySlug
      ) {
        query.set(
          'category',
          intent.categorySlug
        );
      }

      router.push(
        `/ai?${query.toString()}`
      );
    };

  return (
    <section
      className="
        overflow-hidden rounded-3xl
        border border-violet-500/20
        bg-violet-500/5 p-5
        shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_20px_60px_rgba(0,0,0,0.18)]
      ">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-violet-500">
            Context handoff
          </p>

          <h3 className="mt-1 text-base font-bold tracking-tight">
            {title}
          </h3>

          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {description}
          </p>
        </div>

        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-violet-500/10 text-violet-500">
          {mode ===
          'pairing' ? (
            <UtensilsCrossed className="size-5" />
          ) : (
            <BrainCircuit className="size-5" />
          )}
        </span>
      </header>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-violet-500/15 bg-background/60 p-3">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
            Current intent
          </p>

          <p className="mt-1 truncate text-xs font-bold">
            {
              intent.type
            }
          </p>
        </div>

        <div className="rounded-2xl border border-violet-500/15 bg-background/60 p-3">
          <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
            Context target
          </p>

          <p className="mt-1 truncate text-xs font-bold">
            {intent.targetId ??
              intent.categorySlug ??
              'General discovery'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-2xl border border-violet-500/15 bg-background/50 p-3">
        <Sparkles className="mt-0.5 size-4 shrink-0 text-violet-500" />

        <p className="text-[10px] leading-5 text-muted-foreground">
          The destination is currently an assistant foundation with draft-only authority. Full production conversations arrive in the dedicated AI phase.
        </p>
      </div>

      <button
        type="button"
        onClick={
          openAssistant
        }
        className="
          mt-4 flex w-full
          items-center justify-center
          gap-2 rounded-full
          bg-violet-600 px-4 py-2.5
          text-xs font-semibold
          text-white transition
          hover:bg-violet-500
        ">
        Open prepared assistant

        <ArrowRight className="size-3.5" />
      </button>
    </section>
  );
}

export function AiSuggestionsWidget() {
  return (
    <AiEntryWidget mode="suggestions" />
  );
}

export function PairingAssistantWidget() {
  return (
    <AiEntryWidget mode="pairing" />
  );
}

'use client';

import {
  CheckCircle2,
  CircleDot,
  Clock3,
  FolderArchive,
  LoaderCircle
} from 'lucide-react';

import type {
  IntelligenceResolutionSummary
} from '../server/intelligenceMapper';

import {
  ResolutionStatusBadge
} from './ResolutionStatusBadge';

type ResolutionBucketProps = {
  active:
    IntelligenceResolutionSummary[];
  review:
    IntelligenceResolutionSummary[];
  completed:
    IntelligenceResolutionSummary[];
  archived:
    IntelligenceResolutionSummary[];
  loading:
    boolean;
  selectedId?:
    string |
    null;
  onOpen(
    resolutionId:
      string
  ): void;
};

export function ResolutionBucket({
  active,
  review,
  completed,
  archived,
  loading,
  selectedId =
    null,
  onOpen
}: ResolutionBucketProps) {
  if (
    loading &&
    !active.length &&
    !completed.length
  ) {
    return (
      <div className="grid min-h-56 place-items-center">
        <LoaderCircle className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <BucketGroup
        title="Active"
        icon={
          CircleDot
        }
        items={
          active
        }
        selectedId={
          selectedId
        }
        onOpen={
          onOpen
        }
      />

      <BucketGroup
        title="Awaiting review"
        icon={
          Clock3
        }
        items={
          review
        }
        selectedId={
          selectedId
        }
        onOpen={
          onOpen
        }
      />

      <BucketGroup
        title="Completed"
        icon={
          CheckCircle2
        }
        items={
          completed
        }
        selectedId={
          selectedId
        }
        onOpen={
          onOpen
        }
      />

      {archived.length ? (
        <BucketGroup
          title="Archived"
          icon={
            FolderArchive
          }
          items={
            archived
          }
          selectedId={
            selectedId
          }
          onOpen={
            onOpen
          }
        />
      ) : null}
    </div>
  );
}

function BucketGroup({
  title,
  icon:
    Icon,
  items,
  selectedId,
  onOpen
}: {
  title:
    string;
  icon:
    typeof CircleDot;
  items:
    IntelligenceResolutionSummary[];
  selectedId:
    string |
    null;
  onOpen(
    resolutionId:
      string
  ): void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between gap-3 px-1">
        <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">
          <Icon className="size-3.5" />

          {
            title
          }
        </p>

        <span className="text-[10px] font-black text-muted-foreground">
          {
            items.length
          }
        </span>
      </div>

      <div className="mt-2 space-y-2">
        {items.length ? (
          items.map(
            item => (
              <button
                key={
                  item.id
                }
                type="button"
                onClick={() =>
                  onOpen(
                    item.id
                  )
                }
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  selectedId ===
                  item.id
                    ? 'border-primary/35 bg-primary/8 shadow-sm'
                    : 'border-border/60 bg-background/45 hover:bg-muted/35'
                }`}>
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-xs font-black leading-5">
                    {
                      item.title
                    }
                  </p>

                  <span className="shrink-0 text-[10px] font-black text-primary">
                    {
                      item.completion
                    }%
                  </span>
                </div>

                <p className="mt-1 line-clamp-2 text-[9px] leading-4 text-muted-foreground">
                  {
                    item.objective
                  }
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <ResolutionStatusBadge
                    status={
                      item.status
                    }
                  />

                  <span className="text-[9px] text-muted-foreground">
                    {new Date(
                      item.updatedAt
                    ).toLocaleDateString(
                      'en-NG'
                    )}
                  </span>
                </div>
              </button>
            )
          )
        ) : (
          <div className="rounded-2xl border border-dashed px-3 py-4 text-center text-[9px] text-muted-foreground">
            Nothing here yet.
          </div>
        )}
      </div>
    </section>
  );
}

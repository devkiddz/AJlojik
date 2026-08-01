'use client';

import {
  useMemo,
  useState,
  type ReactNode
} from 'react';

import {
  BrainCircuit,
  ListTodo,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCw
} from 'lucide-react';

import type {
  AIAssistantAudience,
  AIAssistantRuntimeContext
} from '@/features/ai-assistance/contracts';

import {
  ResolutionBucket
} from './ResolutionBucket';

import {
  ResolutionComposer
} from './ResolutionComposer';

import {
  ResolutionDetail
} from './ResolutionDetail';

import {
  useIntelligenceWorkspace
} from '../client/useIntelligenceWorkspace';

import {
  OperationsIntelligencePanel
} from '../operations';

import {
  IntelligenceObservabilityPanel
} from '../observability';

type IntelligenceWorkspaceProps = {
  audience:
    AIAssistantAudience;
  workspaceId:
    string;
  vendorProfileId?:
    string |
    null;
  sessionId?:
    string |
    null;
  runtime?:
    Partial<
      AIAssistantRuntimeContext
    >;
  conversation:
    ReactNode;
};

export function IntelligenceWorkspace({
  audience,
  workspaceId,
  vendorProfileId =
    null,
  sessionId =
    null,
  runtime =
    {},
  conversation
}: IntelligenceWorkspaceProps) {
  const [
    mode,
    setMode
  ] =
    useState<
      'resolutions' |
      'conversation'
    >(
      'resolutions'
    );

  const [
    bucketOpen,
    setBucketOpen
  ] =
    useState(
      true
    );

  const scope =
    useMemo(
      () => ({
        audience,
        workspaceId,
        vendorProfileId
      }),
      [
        audience,
        vendorProfileId,
        workspaceId
      ]
    );

  const workspace =
    useIntelligenceWorkspace(
      scope
    );

  if (
    mode ===
    'conversation'
  ) {
    return (
      <div>
        <WorkspaceTabs
          mode={
            mode
          }
          onMode={
            setMode
          }
        />

        {
          conversation
        }
      </div>
    );
  }

  return (
    <div className="min-h-[38rem]">
      <WorkspaceTabs
        mode={
          mode
        }
        onMode={
          setMode
        }
      />

      {workspace.error ? (
        <div className="m-4 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          {
            workspace.error
          }
        </div>
      ) : null}

      <div
        className={`grid gap-4 p-3 sm:p-4 ${
          bucketOpen
            ? 'xl:grid-cols-[19rem_minmax(0,1fr)]'
            : 'grid-cols-1'
        }`}>
        {bucketOpen ? (
          <aside className="rounded-[1.75rem] border border-border/60 bg-background/45 p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-primary">
                  Resolution Bucket
                </p>

                <p className="mt-1 text-[9px] text-muted-foreground">
                  {
                    workspace.resolutions.length
                  }{' '}
                  recorded outcomes
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBucketOpen(
                    false
                  )
                }
                className="grid size-8 place-items-center rounded-full border"
                aria-label="Hide Resolution Bucket">
                <PanelLeftClose className="size-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                workspace.setActiveResolution(
                  null
                )
              }
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-[10px] font-black text-primary-foreground">
              <Plus className="size-3.5" />

              New Resolution
            </button>

            <div className="mt-4">
              <ResolutionBucket
                active={
                  workspace.grouped.active
                }
                review={
                  workspace.grouped.review
                }
                completed={
                  workspace.grouped.completed
                }
                archived={
                  workspace.grouped.archived
                }
                loading={
                  workspace.loading
                }
                selectedId={
                  workspace.activeResolution?.id
                }
                onOpen={resolutionId =>
                  void workspace.open(
                    resolutionId
                  )
                }
              />
            </div>
          </aside>
        ) : null}

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between gap-3">
            {!bucketOpen ? (
              <button
                type="button"
                onClick={() =>
                  setBucketOpen(
                    true
                  )
                }
                className="inline-flex h-9 items-center gap-2 rounded-full border px-3 text-[9px] font-black">
                <PanelLeftOpen className="size-3.5" />

                Resolution Bucket
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              disabled={
                workspace.loading
              }
              onClick={() =>
                void workspace.refresh()
              }
              className="grid size-9 place-items-center rounded-full border disabled:opacity-40"
              aria-label="Refresh Resolutions">
              <RefreshCw className={`size-3.5 ${
                workspace.loading
                  ? 'animate-spin'
                  : ''
              }`} />
            </button>
          </div>

          <OperationsIntelligencePanel
            scope={
              scope
            }
            mutating={
              workspace.mutating
            }
            onStart={input =>
              void workspace.create({
                ...input,
                sessionId,
                runtime: {
                  workspaceId,
                  vendorProfileId,
                  productId:
                    runtime.productId ??
                    null,
                  category:
                    runtime.category ??
                    null,
                  intent:
                    runtime.intent ??
                    null,
                  mode:
                    runtime.mode ??
                    null
                }
              })
            }
          />

          {/* RI_11_12_OBSERVABILITY_SCOPE_REPAIR */}
          <IntelligenceObservabilityPanel
            scope={
              scope
            }
          />

          {workspace.activeResolution ? (
            <ResolutionDetail
              resolution={
                workspace.activeResolution
              }
              mutating={
                workspace.mutating
              }
              onAction={(
                actionId,
                operation
              ) =>
                void workspace.action(
                  actionId,
                  operation
                )
              }
              onDismiss={() =>
                void workspace.transition(
                  'DISMISS'
                )
              }
              onArchive={() =>
                void workspace.transition(
                  'ARCHIVE'
                )
              }
            />
          ) : (
            <ResolutionComposer
              audience={
                audience
              }
              mutating={
                workspace.mutating
              }
              onCreate={input =>
                void workspace.create({
                  ...input,
                  sessionId,
                  runtime: {
                    workspaceId,
                    vendorProfileId,
                    productId:
                      runtime.productId ??
                      null,
                    category:
                      runtime.category ??
                      null,
                    intent:
                      runtime.intent ??
                      null,
                    mode:
                      runtime.mode ??
                      null
                  }
                })
              }
            />
          )}
        </section>
      </div>
    </div>
  );
}

function WorkspaceTabs({
  mode,
  onMode
}: {
  mode:
    'resolutions' |
    'conversation';
  onMode(
    mode:
      'resolutions' |
      'conversation'
  ): void;
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/60 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-2">
        <span className="grid size-9 place-items-center rounded-2xl bg-primary/10 text-primary">
          <BrainCircuit className="size-4" />
        </span>

        <div>
          <p className="text-xs font-black">
            RCENTZ Intelligence
          </p>

          <p className="text-[8px] uppercase tracking-[0.14em] text-muted-foreground">
            Resolution workspace
          </p>
        </div>
      </div>

      <div className="flex rounded-full border bg-background/65 p-1">
        <button
          type="button"
          onClick={() =>
            onMode(
              'resolutions'
            )
          }
          className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-[9px] font-black ${
            mode ===
            'resolutions'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          }`}>
          <ListTodo className="size-3" />

          Resolutions
        </button>

        <button
          type="button"
          onClick={() =>
            onMode(
              'conversation'
            )
          }
          className={`inline-flex h-8 items-center gap-2 rounded-full px-3 text-[9px] font-black ${
            mode ===
            'conversation'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground'
          }`}>
          <MessageSquare className="size-3" />

          Conversation
        </button>
      </div>
    </header>
  );
}

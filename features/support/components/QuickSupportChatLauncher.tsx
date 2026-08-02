'use client';

import {
  Headphones,
  MessagesSquare
} from 'lucide-react';

import {
  usePathname
} from 'next/navigation';

import {
  useGlobalOverlay
} from '@/features/global-overlay';

import {
  QuickSupportChatWorkspace
} from './QuickSupportChatWorkspace';

const hiddenPrefixes = [
  '/admin',
  '/vendor',
  '/support',
  '/sign-in',
  '/sign-up',
  '/adminlogin',
  '/offline',
  '/delivery-access'
] as const;

export function QuickSupportChatLauncher() {
  const pathname =
    usePathname();

  const {
    hasOpenOverlay,
    openOverlay
  } =
    useGlobalOverlay();

  if (
    hasOpenOverlay ||
    hiddenPrefixes.some(
      prefix =>
        pathname === prefix ||
        pathname.startsWith(
          `${prefix}/`
        )
    )
  ) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Chat with AJ Logik Support"
      title="Chat with AJ Logik Support"
      onClick={() =>
        openOverlay({
          id:
            'quick-support-chat',
          eyebrow: (
            <span className="inline-flex items-center gap-2">
              <Headphones className="size-3.5" />
              AJ Logik Support
            </span>
          ),
          title:
            'Chat with Support',
          description:
            'Start or continue a live Support conversation without leaving your current experience.',
          content: (
            <QuickSupportChatWorkspace />
          ),
          variant:
            'panel',
          size:
            'sm',
          closeLabel:
            'Close Support chat'
        })
      }
      className="group fixed bottom-[calc(env(safe-area-inset-bottom)+8.25rem)] right-[var(--app-page-gutter)] z-[180] inline-flex h-11 items-center gap-2 rounded-full border border-emerald-500/30 bg-background/95 px-3.5 text-xs font-black text-foreground shadow-[0_18px_50px_-18px_rgba(0,0,0,0.7)] ring-1 ring-background/20 backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-emerald-500/50 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 md:bottom-5 md:right-[calc(var(--app-page-gutter)+7.5rem)] md:h-12 md:px-4">
      <span className="relative grid size-6 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600">
        <MessagesSquare className="size-4.5" />

        <span
          aria-hidden="true"
          className="absolute -right-0.5 -top-0.5 size-2 rounded-full border border-background bg-emerald-500"
        />
      </span>

      <span>
        Support
      </span>
    </button>
  );
}

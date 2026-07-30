'use client';

import * as React from 'react';
import { Check, MonitorCog, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const subscribeToHydration = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Use device setting', icon: MonitorCog }
] as const;

export default function ThemeController() {
  const { theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot
  );

  if (!mounted) {
    return <div className="size-9 rounded-full border border-border/70 bg-background/70" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Choose appearance"
        title="Choose appearance"
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'relative grid size-9 place-items-center rounded-full border-border/70 bg-background/80 p-0 shadow-sm outline-none'
        )}>
        <Sun className="size-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <Moon className="absolute size-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        <span className="sr-only">Choose theme</span>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        side="left"
        sideOffset={10}
        className="z-[260] w-52 rounded-2xl border border-border/70 bg-popover/98 p-2 shadow-2xl backdrop-blur-xl">
        <p className="px-2 pb-2 pt-1 text-xs font-bold text-foreground">Appearance</p>

        {themeOptions.map(option => {
          const Icon = option.icon;
          const active = theme === option.value;

          return (
            <DropdownMenuItem
              key={option.value}
              onClick={() => setTheme(option.value)}
              className="min-h-10 cursor-pointer rounded-xl px-3 text-sm">
              <Icon className="size-4 text-muted-foreground" />
              <span className="flex-1">{option.label}</span>
              {active ? <Check className="size-4 text-primary" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

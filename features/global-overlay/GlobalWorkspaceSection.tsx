import type {
  ReactNode
} from 'react';

import {
  cn
} from '@/lib/utils';

export function GlobalWorkspaceSection({
  title,
  description,
  icon,
  action,
  children,
  className
}: {
  title:
    ReactNode;

  description?:
    ReactNode;

  icon?:
    ReactNode;

  action?:
    ReactNode;

  children:
    ReactNode;

  className?:
    string;
}) {
  return (
    <section
      className={cn(
        'min-w-0 overflow-hidden rounded-[var(--overlay-radius)] border border-border/60 bg-background/55',
        className
      )}>
      <header className="flex min-w-0 flex-col gap-3 border-b border-border/50 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          {icon ? (
            <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-accent/14 text-accent [&_svg]:size-4">
              {
                icon
              }
            </span>
          ) : null}

          <div className="min-w-0">
            <h3 className="text-sm font-black">
              {
                title
              }
            </h3>

            {description ? (
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {
                  description
                }
              </p>
            ) : null}
          </div>
        </div>

        {action ? (
          <div className="shrink-0">
            {
              action
            }
          </div>
        ) : null}
      </header>

      <div className="min-w-0 p-4 sm:p-5">
        {
          children
        }
      </div>
    </section>
  );
}

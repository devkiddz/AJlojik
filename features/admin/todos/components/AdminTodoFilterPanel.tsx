import type {
  ReactNode
} from 'react';

import Link from 'next/link';

import {
  ArrowUpDown,
  RotateCcw,
  Search,
  SlidersHorizontal
} from 'lucide-react';

import type {
  AdminTargetType,
  AdminTodoPriority,
  AdminTodoSource
} from '@/lib/generated/prisma/client';

import {
  ADMIN_TODO_DATE_FILTERS,
  ADMIN_TODO_PRIORITIES,
  ADMIN_TODO_SORTS,
  ADMIN_TODO_SOURCES,
  ADMIN_TODO_TARGET_TYPES,
  type AdminTodoDateFilter,
  type AdminTodoSort
} from '@/features/admin/todos/adminTodoConstants';

import type {
  AssignableAdminTodoUser
} from '@/features/admin/todos/adminTodoTypes';

type AdminTodoFilterPanelProps = {
  view:
    string;
  priority:
    AdminTodoPriority |
    null;
  source:
    AdminTodoSource |
    null;
  target:
    AdminTargetType |
    null;
  date:
    AdminTodoDateFilter |
    null;
  sort:
    AdminTodoSort;
  assignee:
    string |
    null;
  query:
    string |
    null;
  users:
    AssignableAdminTodoUser[];
};

export function AdminTodoFilterPanel({
  view,
  priority,
  source,
  target,
  date,
  sort,
  assignee,
  query,
  users
}: AdminTodoFilterPanelProps) {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="size-4 text-primary" />

        <h2 className="font-black">
          Queue filters
        </h2>
      </div>

      <form className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <Field label="View">
          <select
            name="view"
            defaultValue={
              view
            }
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="active">
              Active now
            </option>

            <option value="snoozed">
              Snoozed
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="dismissed">
              Dismissed
            </option>

            <option value="all">
              All history
            </option>
          </select>
        </Field>

        <Field label="Todo type">
          <select
            name="source"
            defaultValue={
              source ??
              ''
            }
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="">
              All types
            </option>

            {ADMIN_TODO_SOURCES.map(
              item => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }>
                  {item.replaceAll(
                    '_',
                    ' '
                  )}
                </option>
              )
            )}
          </select>
        </Field>

        <Field label="Target">
          <select
            name="target"
            defaultValue={
              target ??
              ''
            }
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="">
              Every target
            </option>

            {ADMIN_TODO_TARGET_TYPES.map(
              item => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }>
                  {item.replaceAll(
                    '_',
                    ' '
                  )}
                </option>
              )
            )}
          </select>
        </Field>

        <Field label="Priority">
          <select
            name="priority"
            defaultValue={
              priority ??
              ''
            }
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="">
              All priorities
            </option>

            {ADMIN_TODO_PRIORITIES.map(
              item => (
                <option
                  key={
                    item
                  }
                  value={
                    item
                  }>
                  {item}
                </option>
              )
            )}
          </select>
        </Field>

        <Field label="Date focus">
          <select
            name="date"
            defaultValue={
              date ??
              ''
            }
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="">
              Any date
            </option>

            {ADMIN_TODO_DATE_FILTERS.map(
              item => (
                <option
                  key={
                    item.value
                  }
                  value={
                    item.value
                  }>
                  {
                    item.label
                  }
                </option>
              )
            )}
          </select>
        </Field>

        <Field label="Assignee">
          <select
            name="assignee"
            defaultValue={
              assignee ??
              ''
            }
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="">
              Everyone
            </option>

            <option value="unassigned">
              Unassigned
            </option>

            {users.map(
              user => (
                <option
                  key={
                    user.id
                  }
                  value={
                    user.id
                  }>
                  {
                    user.name
                  }
                </option>
              )
            )}
          </select>
        </Field>

        <Field label="Sort by">
          <div className="relative">
            <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <select
              name="sort"
              defaultValue={
                sort
              }
              className="h-11 w-full rounded-2xl border border-border/60 bg-background pl-10 pr-3 text-sm outline-none">
              {ADMIN_TODO_SORTS.map(
                item => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }>
                    {
                      item.label
                    }
                  </option>
                )
              )}
            </select>
          </div>
        </Field>

        <Field label="Search">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <input
              name="q"
              defaultValue={
                query ??
                ''
              }
              placeholder="Title or description"
              className="h-11 w-full rounded-2xl border border-border/60 bg-background pl-10 pr-3 text-sm outline-none"
            />
          </div>
        </Field>

        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2 xl:col-span-1">
          <button className="h-10 rounded-full bg-foreground px-4 text-xs font-bold text-background transition hover:opacity-90">
            Apply filters
          </button>

          <Link
            href="/admin/todos"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-xs font-bold transition hover:bg-muted">
            <RotateCcw className="size-3.5" />

            Clear
          </Link>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children
}: {
  label:
    string;
  children:
    ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>

      {children}
    </label>
  );
}

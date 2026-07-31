import type { ReactNode } from 'react';
import { Search } from 'lucide-react';

import type { AdminTodoPriority } from '@/lib/generated/prisma/client';
import { ADMIN_TODO_PRIORITIES } from '@/features/admin/todos/adminTodoConstants';
import type { AssignableAdminTodoUser } from '@/features/admin/todos/adminTodoTypes';

type AdminTodoFilterPanelProps = {
  view: string;
  priority: AdminTodoPriority | null;
  assignee: string | null;
  query: string | null;
  users: AssignableAdminTodoUser[];
};

export function AdminTodoFilterPanel({
  view,
  priority,
  assignee,
  query,
  users
}: AdminTodoFilterPanelProps) {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Search className="size-4 text-primary" />
        <h2 className="font-black">Queue filters</h2>
      </div>

      <form className="mt-4 space-y-3">
        <Field label="View">
          <select
            name="view"
            defaultValue={view}
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="active">Active now</option>
            <option value="snoozed">Snoozed</option>
            <option value="completed">Completed</option>
            <option value="dismissed">Dismissed</option>
            <option value="all">All history</option>
          </select>
        </Field>

        <Field label="Priority">
          <select
            name="priority"
            defaultValue={priority ?? ''}
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="">All priorities</option>
            {ADMIN_TODO_PRIORITIES.map(item => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Assignee">
          <select
            name="assignee"
            defaultValue={assignee ?? ''}
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
            <option value="">Everyone</option>
            <option value="unassigned">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Search">
          <input
            name="q"
            defaultValue={query ?? ''}
            placeholder="Title or description"
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none"
          />
        </Field>

        <button className="h-10 w-full rounded-full border border-border px-4 text-xs font-bold transition hover:bg-muted">
          Apply filters
        </button>
      </form>
    </section>
  );
}

function Field({
  label,
  children
}: {
  label: string;
  children: ReactNode;
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

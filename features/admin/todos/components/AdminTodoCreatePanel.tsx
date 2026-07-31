import type { ReactNode } from 'react';
import { Plus } from 'lucide-react';

import { createAdminTodo } from '@/features/admin/todos/actions';
import { ADMIN_TODO_PRIORITIES } from '@/features/admin/todos/adminTodoConstants';
import type { AssignableAdminTodoUser } from '@/features/admin/todos/adminTodoTypes';

type AdminTodoCreatePanelProps = {
  users: AssignableAdminTodoUser[];
  canAssign: boolean;
};

export function AdminTodoCreatePanel({
  users,
  canAssign
}: AdminTodoCreatePanelProps) {
  return (
    <section className="rounded-[2rem] border border-border/60 bg-card/80 p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="grid size-10 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Plus className="size-4" />
        </span>
        <div>
          <h2 className="font-black">Create Todo</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Manual work uses the STAFF source and remains auditable.
          </p>
        </div>
      </div>

      <form action={createAdminTodo} className="mt-5 space-y-3">
        <Field label="Title">
          <input
            name="title"
            required
            maxLength={160}
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none focus:border-primary/50"
          />
        </Field>

        <Field label="Description">
          <textarea
            name="description"
            rows={3}
            maxLength={2000}
            className="w-full resize-none rounded-2xl border border-border/60 bg-background p-3 text-sm outline-none focus:border-primary/50"
          />
        </Field>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Field label="Priority">
            <select
              name="priority"
              defaultValue="MEDIUM"
              className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none">
              {ADMIN_TODO_PRIORITIES.map(priority => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Due date">
            <input
              type="date"
              name="dueAt"
              className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none"
            />
          </Field>
        </div>

        <Field label="Assignee">
          <select
            name="assigneeId"
            disabled={!canAssign}
            className="h-11 w-full rounded-2xl border border-border/60 bg-background px-3 text-sm outline-none disabled:opacity-50">
            <option value="">Unassigned</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.name} · {user.role.replaceAll('_', ' ')}
              </option>
            ))}
          </select>
        </Field>

        <button className="h-11 w-full rounded-full bg-foreground px-4 text-xs font-bold text-background">
          Create Todo
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

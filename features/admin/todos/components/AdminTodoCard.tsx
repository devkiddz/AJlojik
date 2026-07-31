import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  XCircle
} from 'lucide-react';

import type { AdminTodoPriority } from '@/lib/generated/prisma/client';
import { updateAdminTodo } from '@/features/admin/todos/actions';
import {
  ACTIVE_ADMIN_TODO_STATUSES,
  ADMIN_TODO_PRIORITIES
} from '@/features/admin/todos/adminTodoConstants';
import type {
  AdminTodoWithRelations,
  AssignableAdminTodoUser
} from '@/features/admin/todos/adminTodoTypes';

type AdminTodoCardProps = {
  todo: AdminTodoWithRelations;
  users: AssignableAdminTodoUser[];
  canManage: boolean;
  canAssign: boolean;
};

export function AdminTodoCard({
  todo,
  users,
  canManage,
  canAssign
}: AdminTodoCardProps) {
  const now = new Date();
  const terminal = todo.status === 'COMPLETED' || todo.status === 'DISMISSED';
  const snoozed = Boolean(todo.snoozedUntil && todo.snoozedUntil > now);
  const overdue = Boolean(todo.dueAt && todo.dueAt < now && !terminal);
  const targetHref = resolveTodoHref(todo);

  return (
    <article className="rounded-[1.75rem] border border-border/60 bg-card/80 p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge value={todo.source} />
            <Badge value={todo.priority} priority={todo.priority} />
            <Badge value={todo.status} />
            {snoozed ? <Badge value="SNOOZED" /> : null}
            {overdue ? <Badge value="OVERDUE" priority="URGENT" /> : null}
          </div>

          <h2 className="mt-3 text-base font-black">{todo.title}</h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            {todo.description ?? 'No additional description.'}
          </p>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-muted-foreground">
            <span>Assignee: {todo.assignee?.name ?? 'Unassigned'}</span>
            <span>
              Due: {todo.dueAt ? todo.dueAt.toLocaleDateString('en-NG') : 'No date'}
            </span>
            <span>Updated: {todo.updatedAt.toLocaleString('en-NG')}</span>
            {todo.createdBy ? <span>Created by: {todo.createdBy.name}</span> : null}
          </div>
        </div>

        {targetHref ? (
          <Link
            href={targetHref}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full border border-border px-3 text-[10px] font-bold transition hover:bg-muted">
            Open target
            <ArrowRight className="size-3" />
          </Link>
        ) : null}
      </div>

      {canManage && !terminal ? (
        <div className="mt-5 grid gap-3 border-t border-border/60 pt-4 lg:grid-cols-2">
          <TodoSelectAction
            todoId={todo.id}
            intent="status"
            name="status"
            defaultValue={todo.status}
            options={ACTIVE_ADMIN_TODO_STATUSES.map(item => ({
              value: item,
              label: item.replaceAll('_', ' ')
            }))}
            buttonLabel="Update status"
          />

          <TodoSelectAction
            todoId={todo.id}
            intent="priority"
            name="priority"
            defaultValue={todo.priority}
            options={ADMIN_TODO_PRIORITIES.map(item => ({
              value: item,
              label: item
            }))}
            buttonLabel="Update priority"
          />

          {canAssign ? (
            <TodoSelectAction
              todoId={todo.id}
              intent="assign"
              name="assigneeId"
              defaultValue={todo.assigneeId ?? ''}
              options={[
                { value: '', label: 'Unassigned' },
                ...users.map(user => ({
                  value: user.id,
                  label: `${user.name} · ${user.role.replaceAll('_', ' ')}`
                }))
              ]}
              buttonLabel="Assign"
            />
          ) : null}

          <form action={updateAdminTodo} className="rounded-2xl border border-border/60 p-3">
            <input type="hidden" name="id" value={todo.id} />
            <input type="hidden" name="intent" value="due" />
            <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Due date
            </label>
            <div className="mt-2 flex gap-2">
              <input
                type="date"
                name="dueAt"
                defaultValue={todo.dueAt?.toISOString().slice(0, 10) ?? ''}
                className="h-9 min-w-0 flex-1 rounded-xl border border-border/60 bg-background px-2 text-xs outline-none"
              />
              <button className="rounded-full bg-foreground px-3 text-[10px] font-bold text-background">
                Save
              </button>
            </div>
          </form>

          <div className="rounded-2xl border border-border/60 p-3 lg:col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Attention controls
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {snoozed ? (
                <IntentButton id={todo.id} intent="unsnooze">
                  Return now
                </IntentButton>
              ) : (
                <>
                  <IntentButton
                    id={todo.id}
                    intent="snooze"
                    hiddenName="snoozedUntil"
                    hiddenValue={new Date(now.getTime() + 60 * 60 * 1000).toISOString()}>
                    Snooze 1 hour
                  </IntentButton>
                  <IntentButton
                    id={todo.id}
                    intent="snooze"
                    hiddenName="snoozedUntil"
                    hiddenValue={new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString()}>
                    Snooze 1 day
                  </IntentButton>
                </>
              )}

              <IntentButton id={todo.id} intent="complete" primary>
                <CheckCircle2 className="size-3" />
                Complete
              </IntentButton>

              <IntentButton id={todo.id} intent="dismiss" destructive>
                <XCircle className="size-3" />
                Dismiss
              </IntentButton>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function TodoSelectAction({
  todoId,
  intent,
  name,
  defaultValue,
  options,
  buttonLabel
}: {
  todoId: string;
  intent: string;
  name: string;
  defaultValue: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  buttonLabel: string;
}) {
  return (
    <form action={updateAdminTodo} className="rounded-2xl border border-border/60 p-3">
      <input type="hidden" name="id" value={todoId} />
      <input type="hidden" name="intent" value={intent} />
      <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
        {buttonLabel}
      </label>
      <div className="mt-2 flex gap-2">
        <select
          name={name}
          defaultValue={defaultValue}
          className="h-9 min-w-0 flex-1 rounded-xl border border-border/60 bg-background px-2 text-xs outline-none">
          {options.map(option => (
            <option key={`${option.value}-${option.label}`} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="rounded-full bg-foreground px-3 text-[10px] font-bold text-background">
          Save
        </button>
      </div>
    </form>
  );
}

function IntentButton({
  id,
  intent,
  hiddenName,
  hiddenValue,
  primary,
  destructive,
  children
}: {
  id: string;
  intent: string;
  hiddenName?: string;
  hiddenValue?: string;
  primary?: boolean;
  destructive?: boolean;
  children: ReactNode;
}) {
  return (
    <form action={updateAdminTodo}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="intent" value={intent} />
      {hiddenName ? (
        <input type="hidden" name={hiddenName} value={hiddenValue} />
      ) : null}
      <button
        className={
          destructive
            ? 'inline-flex h-9 items-center gap-1.5 rounded-full border border-rose-500/20 bg-rose-500/10 px-3 text-[10px] font-bold text-rose-600'
            : primary
              ? 'inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-3 text-[10px] font-bold text-background'
              : 'inline-flex h-9 items-center gap-1.5 rounded-full border border-border px-3 text-[10px] font-bold transition hover:bg-muted'
        }>
        {children}
      </button>
    </form>
  );
}

function Badge({
  value,
  priority
}: {
  value: string;
  priority?: AdminTodoPriority;
}) {
  const className =
    priority === 'URGENT'
      ? 'bg-rose-500/10 text-rose-600'
      : priority === 'HIGH'
        ? 'bg-amber-500/10 text-amber-600'
        : 'bg-muted text-muted-foreground';

  return (
    <span className={`rounded-full px-2 py-1 text-[9px] font-black ${className}`}>
      {value.replaceAll('_', ' ')}
    </span>
  );
}

function resolveTodoHref(todo: {
  source: string;
  targetType: string | null;
  targetId: string | null;
}) {
  if (todo.targetType === 'PRODUCT' && todo.targetId) {
    return `/admin/products/${todo.targetId}`;
  }

  if (todo.targetType === 'ORDER') return '/admin/orders';
  if (todo.targetType === 'DELIVERY' || todo.source === 'DELIVERY') {
    return '/admin/deliveries';
  }
  if (todo.source === 'INVENTORY') return '/admin/inventory';
  if (todo.source === 'APPROVAL') return '/admin/approvals';
  if (todo.targetType === 'SHOPPING_LIST') return '/admin/approvals';
  if (todo.source === 'SUPPORT') return '/admin/customers';

  return null;
}

import {
  CheckCircle2,
  Clock3,
  ListChecks,
  ShieldCheck,
  XCircle
} from 'lucide-react';

import { reviewAdminApproval } from '@/features/admin/approvals/actions';
import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { AdminMetric, AdminPage, AdminPageHeader } from '@/features/admin/components';
import { prisma } from '@/lib/prisma';

export default async function AdminApprovalsPage() {
  const access = await getAdminAccess();

  if (!access.permissions.has('approval:view')) {
    throw new Error('Approval access is required.');
  }

  const requests = await prisma.adminApprovalRequest.findMany({
    where: { workspaceId: access.membership.workspaceId },
    include: {
      requestedBy: { select: { name: true, email: true } },
      reviewedBy: { select: { name: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 150
  });

  const shoppingListIds = requests
    .filter(request => request.targetType === 'SHOPPING_LIST')
    .map(request => request.targetId);

  const shoppingLists = shoppingListIds.length
    ? await prisma.shoppingList.findMany({
        where: {
          workspaceId: access.membership.workspaceId,
          id: { in: shoppingListIds }
        },
        select: {
          id: true,
          name: true,
          description: true,
          publicationStatus: true,
          user: { select: { name: true, email: true } },
          items: {
            orderBy: { position: 'asc' },
            take: 4,
            select: { product: { select: { name: true } } }
          },
          _count: { select: { items: true } }
        }
      })
    : [];

  const shoppingListById = new Map(shoppingLists.map(list => [list.id, list]));
  const pending = requests.filter(request => request.status === 'PENDING').length;
  const approved = requests.filter(request => ['APPROVED', 'EXECUTED'].includes(request.status)).length;
  const rejected = requests.filter(request => request.status === 'REJECTED').length;

  return (
    <AdminPage>
      <div className="space-y-5">
        <AdminPageHeader
          eyebrow="Moderation and governance"
          title="Approval Studio"
          description="Review controlled catalogue, campaign, vendor and customer shopping-list publication requests from one queue."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={Clock3} label="Pending" value={pending} />
          <AdminMetric icon={CheckCircle2} label="Approved or executed" value={approved} />
          <AdminMetric icon={XCircle} label="Rejected" value={rejected} />
          <AdminMetric icon={ShieldCheck} label="Total requests" value={requests.length} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          {requests.map(request => {
            const shoppingList =
              request.targetType === 'SHOPPING_LIST'
                ? shoppingListById.get(request.targetId)
                : undefined;

            return (
              <article
                key={request.id}
                className="rounded-[1.75rem] border border-border/60 bg-card/75 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-primary">
                      {request.targetType} · {request.action.replaceAll('_', ' ')}
                    </p>
                    <h2 className="mt-2 text-sm font-black">{request.reason}</h2>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Requested by {request.requestedBy.name} ·{' '}
                      {request.createdAt.toLocaleString('en-NG')}
                    </p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>

                {shoppingList ? (
                  <div className="mt-4 rounded-2xl border bg-background/65 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 text-primary">
                          <ListChecks className="size-4" />
                          <span className="text-xs font-bold uppercase tracking-[0.12em]">
                            Customer public list
                          </span>
                        </div>
                        <h3 className="mt-2 truncate font-bold">{shoppingList.name}</h3>
                        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                          {shoppingList.description ?? 'No description supplied.'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <span className="rounded-full border px-2.5 py-1">
                        {shoppingList._count.items} products
                      </span>
                      <span className="rounded-full border px-2.5 py-1">
                        Owner: {shoppingList.user.name}
                      </span>
                      <span className="rounded-full border px-2.5 py-1">
                        {shoppingList.publicationStatus.replaceAll('_', ' ')}
                      </span>
                    </div>
                    {shoppingList.items.length ? (
                      <div className="mt-3 space-y-1.5">
                        {shoppingList.items.map((item, index) => (
                          <p key={`${item.product.name}-${index}`} className="text-xs text-muted-foreground">
                            {index + 1}. {item.product.name}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {request.reviewNote ? (
                  <p className="mt-4 rounded-2xl bg-muted/50 p-3 text-xs text-muted-foreground">
                    {request.reviewNote}
                  </p>
                ) : null}

                {request.status === 'PENDING' && access.permissions.has('approval:review') ? (
                  <div className="mt-4 grid gap-2 sm:grid-cols-2">
                    <Decision id={request.id} decision="APPROVED" />
                    <Decision id={request.id} decision="REJECTED" />
                  </div>
                ) : null}

                {request.reviewedBy ? (
                  <p className="mt-4 text-[10px] text-muted-foreground">
                    Reviewed by {request.reviewedBy.name}
                  </p>
                ) : null}
              </article>
            );
          })}
        </section>
      </div>
    </AdminPage>
  );
}

function StatusBadge({ status }: { status: string }) {
  const className =
    status === 'PENDING'
      ? 'bg-amber-500/10 text-amber-600'
      : status === 'REJECTED'
        ? 'bg-rose-500/10 text-rose-600'
        : 'bg-emerald-500/10 text-emerald-600';

  return (
    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${className}`}>
      {status}
    </span>
  );
}

function Decision({ id, decision }: { id: string; decision: 'APPROVED' | 'REJECTED' }) {
  return (
    <form action={reviewAdminApproval} className="rounded-2xl border border-border/60 p-3">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="decision" value={decision} />
      <textarea
        name="reviewNote"
        rows={2}
        placeholder={`${decision === 'APPROVED' ? 'Approval' : 'Rejection'} note`}
        className="w-full resize-none rounded-xl border border-border/60 bg-background p-2 text-xs outline-none"
      />
      <button
        className={
          decision === 'APPROVED'
            ? 'mt-2 h-9 w-full rounded-full bg-foreground text-xs font-bold text-background'
            : 'mt-2 h-9 w-full rounded-full border border-border text-xs font-bold'
        }>
        {decision === 'APPROVED' ? 'Approve and publish' : 'Reject request'}
      </button>
    </form>
  );
}

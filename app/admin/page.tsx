import Link from 'next/link';
import { AlertTriangle, ArrowRight, Boxes, CheckCircle2, Clapperboard, ClipboardCheck, Grid2X2Plus, ListTodo, PackagePlus, ShieldCheck, Sparkles, Tags, Truck, UsersRound } from 'lucide-react';

import type { Prisma } from '@/lib/generated/prisma/client';

import { getAdminAccess } from '@/features/admin/auth/adminPermissions';
import { reviewAdminApproval } from '@/features/admin/approvals/actions';
import { generateAdminTodos } from '@/features/admin/todos/generateAdminTodos';
import { prisma } from '@/lib/prisma';

export default async function AdminHomePage() {
  const access = await getAdminAccess();
  await generateAdminTodos(access.membership.workspaceId).catch(error => {
    console.error('Unable to refresh admin todos.', error);
  });

  const now = new Date();
  const activeTodoWhere: Prisma.AdminTodoWhereInput = {
    workspaceId: access.membership.workspaceId,
    status: { in: ['OPEN', 'IN_PROGRESS', 'BLOCKED'] },
    OR: [{ snoozedUntil: null }, { snoozedUntil: { lte: now } }]
  };

  const [todos, activeTodoCount, approvals, staffCount, productCount, deliveries, recentActivity] = await Promise.all([
    prisma.adminTodo?.findMany ? prisma.adminTodo.findMany({ where: activeTodoWhere, orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }], take: 8 }).catch(() => []) : Promise.resolve([]),
    prisma.adminTodo?.count ? prisma.adminTodo.count({ where: activeTodoWhere }).catch(() => 0) : Promise.resolve(0),
    prisma.adminApprovalRequest?.findMany ? prisma.adminApprovalRequest.findMany({ where: { workspaceId: access.membership.workspaceId, status: 'PENDING' }, include: { requestedBy: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 6 }).catch(() => []) : Promise.resolve([]),
    prisma.staffProfile?.count ? prisma.staffProfile.count({ where: { workspaceId: access.membership.workspaceId, active: true } }).catch(() => 0) : Promise.resolve(0),
    prisma.product.count({ where: { workspaceId: access.membership.workspaceId, active: true } }).catch(() => 0),
    prisma.delivery?.count ? prisma.delivery.count({ where: { workspaceId: access.membership.workspaceId, status: { notIn: ['DELIVERED', 'CANCELLED', 'FAILED'] } } }).catch(() => 0) : Promise.resolve(0),
    prisma.adminAuditEvent?.findMany ? prisma.adminAuditEvent.findMany({ where: { workspaceId: access.membership.workspaceId }, include: { actor: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 6 }).catch(() => []) : Promise.resolve([])
  ]);

  const canReview = access.permissions.has('approval:review');
  return (
    <main className="admin-page min-h-dvh bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.1),transparent_34%)] px-3 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[96rem] space-y-5">
        <header className="rounded-[2rem] border border-border/60 bg-card/85 p-5 shadow-xl sm:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/70">{access.membership.workspace.name} · {access.membership.workspace.mode}</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-5xl">Admin attention center</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Every login begins with work requiring attention, approvals, store health, and live operations.</p></div><span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-2 text-[10px] font-bold uppercase text-emerald-600"><ShieldCheck className="size-4" /> {access.membership.role.replaceAll('_', ' ')}</span></div>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric href="/admin/todos" icon={<ClipboardCheck />} label="Open todos" value={activeTodoCount} tone="violet" /><Metric href="/admin/approvals" icon={<AlertTriangle />} label="Awaiting approval" value={approvals.length} tone="amber" /><Metric href="/admin/deliveries" icon={<Truck />} label="Active deliveries" value={deliveries} tone="blue" /><Metric href="/admin/staff" icon={<UsersRound />} label="Active staff" value={staffCount} tone="emerald" /></section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
          <Panel eyebrow="Management queue" title="Do next" description="Automatically generated from inventory, approvals, and delivery activity.">
            <div className="mt-5 space-y-3">{todos.length ? todos.map(todo => <Link key={todo.id} href={resolveTodoHref(todo)} className="group flex items-start gap-3 rounded-2xl border border-border/50 bg-background/55 p-4 transition hover:border-primary/25 hover:bg-muted/45"><span className="mt-1 size-2 shrink-0 rounded-full bg-primary" /><div className="min-w-0 flex-1"><p className="text-xs font-bold">{todo.title}</p><p className="mt-1 text-[10px] leading-4 text-muted-foreground">{todo.description}</p><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-primary">Open task <ArrowRight className="size-3 transition group-hover:translate-x-0.5" /></span></div><span className="rounded-full bg-muted px-2 py-1 text-[8px] font-bold">{todo.priority}</span></Link>) : <Empty label="No urgent work is waiting." />}</div>
          </Panel>
          <Panel eyebrow="Quick create" title="Commerce studios" description="Publish only within the active workspace.">
            <div className="mt-5 grid gap-2"><QuickLink href="/admin/account" icon={<ShieldCheck />} label="My administrator account" /><QuickLink href="/admin/todos" icon={<ListTodo />} label="Admin Todo Studio" /><QuickLink href="/admin/preparations" icon={<ClipboardCheck />} label="Shopping List preparation" /><QuickLink href="/admin/products/new" icon={<PackagePlus />} label="Add product" /><QuickLink href="/admin/products" icon={<Boxes />} label={`${productCount} live products`} /><QuickLink href="/admin/categories" icon={<Grid2X2Plus />} label="Category Studio" /><QuickLink href="/admin/brands" icon={<Tags />} label="Brand Studio" />{access.permissions.has('experience:manage') ? <QuickLink href="/admin/store-studio" icon={<Clapperboard />} label="Store Studio campaigns" /> : null}{access.permissions.has('system:manage') ? <><QuickLink href="/admin/accounts" icon={<UsersRound />} label="All account control" /><QuickLink href="/admin/hero" icon={<Sparkles />} label="Homepage hero studio" /></> : null}<QuickLink href="/admin/staff" icon={<UsersRound />} label="Staff and access" /><QuickLink href="/admin/deliveries" icon={<Truck />} label="Delivery operations" /></div>
          </Panel>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Panel eyebrow="Controlled actions" title="Approval inbox" description="Level 2 requests require Level 3 or Super Admin review.">
            <div className="mt-5 space-y-3">{approvals.length ? approvals.map(request => <article key={request.id} className="rounded-2xl border border-border/60 bg-background/55 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold">{request.action.replaceAll('_', ' ')}</p><p className="mt-1 text-[10px] text-muted-foreground">{request.requestedBy.name} · {request.targetType}</p></div><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[8px] font-bold text-amber-600">PENDING</span></div><p className="mt-3 text-xs leading-5 text-muted-foreground">{request.reason}</p>{canReview ? <div className="mt-4 flex gap-2"><DecisionForm id={request.id} decision="APPROVED" /><DecisionForm id={request.id} decision="REJECTED" /></div> : null}</article>) : <Empty label="No approval requests are waiting." />}</div>
          </Panel>
          <Panel eyebrow="Immutable history" title="Recent admin activity" description="Security and commerce actions are recorded for accountability.">
            <div className="mt-5 space-y-3">{recentActivity.length ? recentActivity.map(event => <Link key={event.id} href="/admin/activity" className="group flex gap-3 border-b border-border/50 pb-3 last:border-0"><div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><CheckCircle2 className="size-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-bold">{event.summary}</p><p className="mt-1 text-[9px] text-muted-foreground">{event.actor?.name ?? 'System'} · {event.createdAt.toLocaleString('en-NG')}</p></div><ArrowRight className="mt-2 size-3.5 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" /></Link>) : <Empty label="Activity will appear as staff use the control center." />}</div>
          </Panel>
        </section>

        <section className="rounded-[2rem] border border-primary/20 bg-primary/5 p-5 sm:p-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex gap-3"><div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></div><div><h2 className="font-bold">AJ Studio Manager foundation</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">Reviewable catalog, campaign, media and operational suggestions are now defined. Every accepted action will remain permission-controlled and auditable.</p></div></div><Link href="/admin/assistant" className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-[10px] font-bold text-background">Open foundation <ArrowRight className="size-3.5" /></Link></div></section>
      </div>
    </main>
  );
}

function resolveTodoHref(todo: { source: string; targetType: string | null; targetId: string | null }): string {
  if (todo.targetType === 'PRODUCT' && todo.targetId) return `/admin/products/${todo.targetId}`;
  if (todo.targetType === 'DELIVERY' || todo.source === 'DELIVERY') return '/admin/deliveries';
  if (todo.source === 'INVENTORY') return '/admin/inventory';
  if (todo.source === 'SHOPPING_LIST') return '/admin/preparations';
  if (todo.source === 'APPROVAL' || todo.targetType === 'SHOPPING_LIST') return '/admin/approvals';
  return '/admin/todos';
}

function Metric({ href, icon, label, value, tone }: { href: string; icon: React.ReactNode; label: string; value: number; tone: 'violet' | 'amber' | 'blue' | 'emerald' }) { const colors={violet:'bg-violet-500/10 text-violet-600',amber:'bg-amber-500/10 text-amber-600',blue:'bg-blue-500/10 text-blue-600',emerald:'bg-emerald-500/10 text-emerald-600'}; return <Link href={href} className="group rounded-3xl border border-border/60 bg-card/75 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg"><div className="flex items-start justify-between gap-3"><div className={`grid size-10 place-items-center rounded-2xl [&_svg]:size-4 ${colors[tone]}`}>{icon}</div><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" /></div><p className="mt-5 text-[10px] text-muted-foreground">{label}</p><p className="mt-1 text-3xl font-black">{value}</p><span className="mt-3 inline-flex text-[10px] font-bold text-primary">Open report</span></Link>; }
function Panel({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children: React.ReactNode }) { return <section className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">{eyebrow}</p><h2 className="mt-1 text-xl font-black">{title}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>{children}</section>; }
function QuickLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) { return <Link href={href} className="group flex items-center gap-3 rounded-2xl border border-border/50 bg-background/55 p-3 transition hover:bg-muted"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-4">{icon}</span><span className="flex-1 text-xs font-bold">{label}</span><ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" /></Link>; }
function Empty({ label }: { label: string }) { return <div className="grid min-h-28 place-items-center rounded-2xl border border-dashed border-border/70 p-5 text-center text-xs text-muted-foreground">{label}</div>; }
function DecisionForm({ id, decision }: { id: string; decision: 'APPROVED' | 'REJECTED' }) { return <form action={reviewAdminApproval}><input type="hidden" name="id" value={id} /><input type="hidden" name="decision" value={decision} /><button className={decision === 'APPROVED' ? 'rounded-full bg-foreground px-3 py-2 text-[9px] font-bold text-background' : 'rounded-full border border-border px-3 py-2 text-[9px] font-bold'}>{decision === 'APPROVED' ? 'Approve' : 'Reject'}</button></form>; }

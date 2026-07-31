import {
  Code2,
  PackageSearch,
  ShieldAlert,
  Store,
  UsersRound,
  Workflow,
  type LucideIcon
} from 'lucide-react';

import {
  AdminMetric,
  AdminPage,
  AdminPageHeader,
  AdminPanel
} from '@/features/admin/components';
import { requireDeveloperAdmin } from '@/features/admin/auth/adminPermissions';
import { updateWorkspaceCommerceMode } from '@/features/admin/system/actions';
import { getCommerceModeDowngradeImpact } from '@/features/commerce-mode/server/getCommerceModeDowngradeImpact';
import { prisma } from '@/lib/prisma';

export default async function AdminSystemPage() {
  const access = await requireDeveloperAdmin();

  const workspaces = await prisma.workspace.findMany({
    include: {
      _count: {
        select: {
          vendors: true,
          products: true,
          memberships: true
        }
      }
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  const impacts = new Map(
    await Promise.all(
      workspaces.map(async workspace => [
        workspace.id,
        await getCommerceModeDowngradeImpact(workspace.id)
      ] as const)
    )
  );

  return (
    <AdminPage>
      <div className="mx-auto max-w-6xl space-y-5">
        <AdminPageHeader
          eyebrow="Platform authority"
          title="Developer System Management"
          description="Control workspace Commerce Mode through one capability boundary. Marketplace data remains preserved when vendor storefronts are disabled."
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminMetric icon={Code2} label="Developer authority" value="ACTIVE" />
          <AdminMetric icon={Store} label="Workspaces" value={workspaces.length} />
          <AdminMetric
            icon={Workflow}
            label="Marketplace workspaces"
            value={workspaces.filter(
              workspace => workspace.commerceMode === 'MULTI_VENDOR'
            ).length}
          />
          <AdminMetric
            icon={ShieldAlert}
            label="Protected capability"
            value="COMMERCE MODE"
          />
        </section>

        <div className="rounded-[2rem] border border-rose-500/25 bg-rose-500/10 p-5 text-sm text-rose-700">
          <strong>Platform security boundary.</strong>
          <p className="mt-2 text-xs leading-5">
            Only Developer Admin can change Commerce Mode. A downgrade never
            deletes vendor records, but it immediately hides vendor products,
            shops and campaigns from public customer experiences.
          </p>
        </div>

        <AdminPanel
          title="Workspace Commerce Modes"
          description="Single Merchant serves platform-owned commerce only. Multi Vendor activates verified shops, Vendor Studio and vendor publishing.">
          <div className="grid gap-4 sm:grid-cols-2">
            {workspaces.map(workspace => {
              const impact = impacts.get(workspace.id);
              const marketplaceActive =
                workspace.commerceMode === 'MULTI_VENDOR';

              return (
                <article
                  key={workspace.id}
                  className="rounded-3xl border border-border/60 bg-background/60 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-primary">
                        {workspace.mode}
                      </p>
                      <h2 className="mt-2 text-sm font-black">
                        {workspace.name}
                      </h2>
                    </div>
                    <span className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-[8px] font-bold">
                      {workspace.commerceMode.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <p className="mt-2 text-[10px] text-muted-foreground">
                    {workspace._count.products} products ·{' '}
                    {workspace._count.vendors} vendors ·{' '}
                    {workspace._count.memberships} members
                  </p>

                  {marketplaceActive && impact ? (
                    <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-muted/35 p-3 text-center">
                      <ImpactMetric
                        icon={UsersRound}
                        label="Active vendors"
                        value={impact.activeVendors}
                      />
                      <ImpactMetric
                        icon={PackageSearch}
                        label="Vendor products"
                        value={impact.vendorProducts}
                      />
                      <ImpactMetric
                        icon={Workflow}
                        label="Open approvals"
                        value={impact.openVendorApprovals}
                      />
                    </div>
                  ) : null}

                  <form
                    action={updateWorkspaceCommerceMode}
                    className="mt-4 space-y-3">
                    <input
                      type="hidden"
                      name="workspaceId"
                      value={workspace.id}
                    />

                    <div className="flex gap-2">
                      <select
                        name="commerceMode"
                        defaultValue={workspace.commerceMode}
                        className="h-10 min-w-0 flex-1 rounded-xl border border-border/70 bg-background px-2 text-xs">
                        <option value="SINGLE_MERCHANT">
                          Single Merchant
                        </option>
                        <option value="MULTI_VENDOR">
                          Multi Vendor
                        </option>
                      </select>

                      <button className="rounded-full bg-foreground px-4 text-[9px] font-bold text-background">
                        Apply
                      </button>
                    </div>

                    {marketplaceActive && impact?.requiresAcknowledgement ? (
                      <label className="flex items-start gap-2 rounded-2xl border border-amber-500/25 bg-amber-500/10 p-3 text-[9px] leading-4 text-amber-700">
                        <input
                          type="checkbox"
                          name="acknowledgeDowngrade"
                          className="mt-0.5"
                        />
                        <span>
                          I understand that selecting Single Merchant will
                          immediately hide {impact.publishedVendorProducts}{' '}
                          published vendor products,{' '}
                          {impact.publishedVendorCollections} collections,{' '}
                          {impact.publishedVendorPromotions} promotions and{' '}
                          {impact.liveVendorCampaigns} live campaigns. Data will
                          be preserved.
                        </span>
                      </label>
                    ) : null}
                  </form>
                </article>
              );
            })}
          </div>
        </AdminPanel>

        <p className="text-[9px] text-muted-foreground">
          Authenticated as Developer Admin: {access.actor.email}
        </p>
      </div>
    </AdminPage>
  );
}

function ImpactMetric({
  icon: Icon,
  label,
  value
}: {
  icon: LucideIcon;
  label: string;
  value: number;
}) {
  return (
    <div>
      <Icon className="mx-auto size-3.5 text-primary" />
      <strong className="mt-1 block text-xs">{value}</strong>
      <span className="block text-[0.48rem] uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

import {
  InboxWorkspace
} from '@/features/communication';
import {
  getCustomerCommunicationInbox
} from '@/features/communication/server/communicationRepository';
import {
  resolveCommunicationWorkspace
} from '@/features/communication/server/resolveCommunicationWorkspace';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function InboxPage() {
  const { userId, workspace } =
    await resolveCommunicationWorkspace(
      '/inbox'
    );

  const snapshot =
    await getCustomerCommunicationInbox(
      userId,
      workspace.id,
      100
    );

  const vendorRecords =
    await prisma.vendorProfile.findMany({
      where: {
        workspaceId: workspace.id,
        status: 'ACTIVE',
        active: true
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoMediaAsset: {
          select: {
            secureUrl: true
          }
        }
      }
    });

  return (
    <InboxWorkspace
      audience="customer"
      initialSnapshot={snapshot}
      vendors={vendorRecords.map(vendor => ({
        id: vendor.id,
        name: vendor.name,
        slug: vendor.slug,
        logoUrl:
          vendor.logoMediaAsset?.secureUrl ??
          null
      }))}
    />
  );
}

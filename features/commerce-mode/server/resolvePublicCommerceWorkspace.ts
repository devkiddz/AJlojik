import 'server-only';

import { prisma } from '@/lib/prisma';

import type {
  CommerceMode,
  PublicCommerceWorkspace
} from '../commerceModeTypes';
import { resolveCommerceCapabilities } from '../resolveCommerceCapabilities';

export async function resolvePublicCommerceWorkspace(
  requestedWorkspaceId?: string | null
): Promise<PublicCommerceWorkspace | null> {
  const normalizedWorkspaceId = requestedWorkspaceId?.trim();

  const workspace = await prisma.workspace.findFirst({
    where: normalizedWorkspaceId
      ? {
          id: normalizedWorkspaceId,
          active: true
        }
      : {
          active: true,
          mode: 'LIVE'
        },
    orderBy: {
      createdAt: 'asc'
    },
    select: {
      id: true,
      slug: true,
      name: true,
      mode: true,
      commerceMode: true,
      vendorApplicationsOpen: true,
      currency: true,
      timezone: true
    }
  });

  if (!workspace) {
    return null;
  }

  const commerceMode = workspace.commerceMode as CommerceMode;

  return {
    ...workspace,
    commerceMode,
    capabilities: resolveCommerceCapabilities(commerceMode, {
      vendorApplicationsOpen: workspace.vendorApplicationsOpen
    })
  };
}

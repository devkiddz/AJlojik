import 'server-only';

import type {
  AIAssistantAudience
} from '../contracts';

import {
  getAdminApiAccess
} from '@/features/admin/auth/adminPermissions';

import {
  getVendorApiAccess
} from '@/features/vendor/auth/vendorAccess';

import {
  auth
} from '@/lib/auth';

import {
  prisma
} from '@/lib/prisma';

import {
  AssistantRuntimeError
} from './assistantRouteResponse';

export type AssistantAccess = {
  audience:
    AIAssistantAudience;
  userId:
    string;
  workspaceId:
    string;
  vendorProfileId:
    string |
    null;
  contextLabel:
    string;
  permissions:
    ReadonlySet<string>;
};

export async function resolveAssistantAccess(
  requestHeaders:
    Headers,
  input: {
    audience:
      AIAssistantAudience;
    workspaceId:
      string;
    vendorProfileId?:
      string |
      null;
  }
): Promise<AssistantAccess> {
  const workspaceId =
    input.workspaceId.trim();

  if (!workspaceId) {
    throw new AssistantRuntimeError(
      'An active workspace is required.',
      400
    );
  }

  if (
    input.audience ===
    'admin'
  ) {
    const access =
      await getAdminApiAccess(
        requestHeaders
      );

    if (!access) {
      throw new AssistantRuntimeError(
        'Administrator authentication is required.',
        401
      );
    }

    if (
      access.membership.workspaceId !==
      workspaceId
    ) {
      throw new AssistantRuntimeError(
        'The selected workspace is outside this administrator session.',
        403
      );
    }

    if (
      !access.permissions.has(
        'analytics:view'
      ) &&
      !access.permissions.has(
        'experience:manage'
      )
    ) {
      throw new AssistantRuntimeError(
        'Workspace intelligence access is required.',
        403
      );
    }

    return {
      audience:
        'admin',
      userId:
        access.session.user.id,
      workspaceId,
      vendorProfileId:
        null,
      contextLabel:
        `${access.membership.workspace.name} · ${access.membership.role.replaceAll('_', ' ')}`,
      permissions:
        access.permissions
    };
  }

  if (
    input.audience ===
    'vendor'
  ) {
    const access =
      await getVendorApiAccess(
        requestHeaders
      );

    if (!access) {
      throw new AssistantRuntimeError(
        'Vendor authentication is required.',
        401
      );
    }

    if (
      access.workspace.id !==
        workspaceId ||
      (
        input.vendorProfileId &&
        access.vendor.id !==
          input.vendorProfileId
      )
    ) {
      throw new AssistantRuntimeError(
        'The selected vendor or workspace is outside this session.',
        403
      );
    }

    if (
      !access.permissions.has(
        'vendor:view'
      )
    ) {
      throw new AssistantRuntimeError(
        'Vendor intelligence access is required.',
        403
      );
    }

    return {
      audience:
        'vendor',
      userId:
        access.session.user.id,
      workspaceId,
      vendorProfileId:
        access.vendor.id,
      contextLabel:
        `${access.vendor.name} · ${access.membership.role.replaceAll('_', ' ')}`,
      permissions:
        access.permissions
    };
  }

  const session =
    await auth.api
      .getSession({
        headers:
          requestHeaders
      })
      .catch(
        () =>
          null
      );

  if (!session?.user?.id) {
    throw new AssistantRuntimeError(
      'Authentication is required.',
      401
    );
  }

  const membership =
    await prisma.workspaceMembership.findFirst({
      where: {
        workspaceId,
        userId:
          session.user.id,
        active:
          true,
        workspace: {
          active:
            true
        }
      },
      include: {
        workspace:
          true
      }
    });

  if (!membership) {
    throw new AssistantRuntimeError(
      'Workspace access is required.',
      403
    );
  }

  return {
    audience:
      'customer',
    userId:
      session.user.id,
    workspaceId,
    vendorProfileId:
      null,
    contextLabel:
      `${membership.workspace.name} · Customer intelligence`,
    permissions:
      new Set<string>()
  };
}

import { notFound } from 'next/navigation';

import {
  AgentSupportCaseWorkspace
} from '@/features/support/components/AgentSupportCaseWorkspace';
import {
  getAgentSupportCase
} from '@/features/support/server/supportRepository';
import {
  requireAdminPermission
} from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type AdminSupportCasePageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function AdminSupportCasePage({
  params
}: AdminSupportCasePageProps) {
  const { caseId } = await params;
  const access =
    await requireAdminPermission(
      'support:view'
    );
  const workspaceId =
    access.membership.workspace.id;

  const supportCase =
    await getAgentSupportCase(
      caseId,
      workspaceId
    );

  if (!supportCase) {
    notFound();
  }

  const memberships =
    await prisma.workspaceMembership.findMany({
      where: {
        workspaceId,
        active: true,
        role: {
          in: [
            'SUPPORT',
            'MANAGER',
            'ADMIN',
            'OWNER',
            'SUPER_ADMIN'
          ]
        }
      },
      orderBy: {
        joinedAt: 'asc'
      },
      select: {
        role: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

  return (
    <AgentSupportCaseWorkspace
      actorUserId={access.actor.id}
      initialCase={supportCase}
      agents={memberships.map(item => ({
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        role: item.role
      }))}
      permissions={{
        reply:
          access.permissions.has(
            'support:reply'
          ),
        assign:
          access.permissions.has(
            'support:assign'
          ),
        escalate:
          access.permissions.has(
            'support:escalate'
          ),
        resolve:
          access.permissions.has(
            'support:resolve'
          )
      }}
    />
  );
}

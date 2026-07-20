import type { PrismaClient } from '../../lib/generated/prisma/client';

import { auth } from '../../lib/auth';

import type { SeededWorkspaces } from './workspace.seed';

const DEVELOPER_EMAIL = 'developer@rcentzlab.com';
const DEMO_EMAIL = 'demo.superadmin@ajlojik.com';

export async function seedAdminAccounts(prisma: PrismaClient, workspaces: SeededWorkspaces) {
  const developer = await prisma.user.findFirst({ where: { email: { in: [DEVELOPER_EMAIL, 'devkiddzadmin@recentzadmin.com'] } }, select: { id: true } });

  if (developer) {
    await prisma.user.update({ where: { id: developer.id }, data: { email: DEVELOPER_EMAIL, isGhostDeveloper: true, accountState: 'ACTIVE', lockedUntil: null, restrictionReason: null } });
    await prisma.workspaceMembership.upsert({
      where: { workspaceId_userId: { workspaceId: workspaces.live.id, userId: developer.id } },
      update: { role: 'SUPER_ADMIN', active: true },
      create: { workspaceId: workspaces.live.id, userId: developer.id, role: 'SUPER_ADMIN', active: true }
    });
  } else {
    console.warn(`Developer Super Admin ${DEVELOPER_EMAIL} does not exist yet; create the identity before assigning live access.`);
  }

  let demo = await prisma.user.findUnique({ where: { email: DEMO_EMAIL }, select: { id: true } });

  if (!demo) {
    const demoPassword = process.env.DEMO_ADMIN_PASSWORD;

    if (!demoPassword) {
      throw new Error('DEMO_ADMIN_PASSWORD is required when creating the demo Super Admin identity.');
    }

    await auth.api.signUpEmail({
      body: {
        name: 'AJ Logik Demo Super Admin',
        email: DEMO_EMAIL,
        password: demoPassword
      }
    });
    demo = await prisma.user.findUniqueOrThrow({ where: { email: DEMO_EMAIL }, select: { id: true } });
  }

  await prisma.workspaceMembership.upsert({
    where: { workspaceId_userId: { workspaceId: workspaces.demo.id, userId: demo.id } },
    update: { role: 'SUPER_ADMIN', active: true },
    create: { workspaceId: workspaces.demo.id, userId: demo.id, role: 'SUPER_ADMIN', active: true }
  });

  console.log(`Demo Super Admin ready: ${DEMO_EMAIL}`);
}

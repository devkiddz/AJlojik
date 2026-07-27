import { randomUUID } from 'node:crypto';

import type {
  PrismaClient
} from '../../lib/generated/prisma/client';

import {
  hashPassword
} from 'better-auth/crypto';

import type {
  SeededWorkspaces
} from './workspace.seed';

const DEVELOPER_EMAIL =
  'developer@rcentzlab.com';

const LEGACY_DEVELOPER_EMAIL =
  'devkiddzadmin@recentzadmin.com';

const DEMO_EMAIL =
  'demo.superadmin@ajlojik.com';

async function ensureCredentialAccount(
  prisma: PrismaClient,
  input: {
    userId: string;
    password: string;
  }
): Promise<void> {
  const passwordHash =
    await hashPassword(
      input.password
    );

  const existingAccount =
    await prisma.account.findFirst({
      where: {
        userId:
          input.userId,

        providerId:
          'credential'
      },

      select: {
        id: true
      }
    });

  if (existingAccount) {
    await prisma.account.update({
      where: {
        id:
          existingAccount.id
      },

      data: {
        accountId:
          input.userId,

        password:
          passwordHash
      }
    });

    return;
  }

  await prisma.account.create({
    data: {
      id:
        randomUUID(),

      accountId:
        input.userId,

      providerId:
        'credential',

      userId:
        input.userId,

      password:
        passwordHash
    }
  });
}

async function seedDeveloperAdmin(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
): Promise<void> {
  const developer =
    await prisma.user.findFirst({
      where: {
        email: {
          in: [
            DEVELOPER_EMAIL,
            LEGACY_DEVELOPER_EMAIL
          ]
        }
      },

      select: {
        id: true
      }
    });

  if (!developer) {
    console.warn(
      `Developer Super Admin ${DEVELOPER_EMAIL} does not exist yet; create the identity before assigning live access.`
    );

    return;
  }

  await prisma.user.update({
    where: {
      id:
        developer.id
    },

    data: {
      email:
        DEVELOPER_EMAIL,

      isGhostDeveloper:
        true,

      accountState:
        'ACTIVE',

      lockedUntil:
        null,

      restrictionReason:
        null
    }
  });

  await prisma.workspaceMembership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId:
          workspaces.live.id,

        userId:
          developer.id
      }
    },

    update: {
      role:
        'SUPER_ADMIN',

      active:
        true
    },

    create: {
      workspaceId:
        workspaces.live.id,

      userId:
        developer.id,

      role:
        'SUPER_ADMIN',

      active:
        true
    }
  });
}

async function seedDemoAdmin(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
): Promise<void> {
  const demoPassword =
    process.env
      .DEMO_ADMIN_PASSWORD;

  if (!demoPassword) {
    throw new Error(
      'DEMO_ADMIN_PASSWORD is required when creating the demo Super Admin identity.'
    );
  }

  let demo =
    await prisma.user.findUnique({
      where: {
        email:
          DEMO_EMAIL
      },

      select: {
        id: true
      }
    });

  if (!demo) {
    demo =
      await prisma.user.create({
        data: {
          id:
            randomUUID(),

          name:
            'AJ Logik Demo Super Admin',

          email:
            DEMO_EMAIL,

          emailVerified:
            true,

          tier:
            'member',

          accountState:
            'ACTIVE',

          isGhostDeveloper:
            false
        },

        select: {
          id: true
        }
      });
  } else {
    await prisma.user.update({
      where: {
        id:
          demo.id
      },

      data: {
        name:
          'AJ Logik Demo Super Admin',

        emailVerified:
          true,

        accountState:
          'ACTIVE',

        lockedUntil:
          null,

        restrictionReason:
          null
      }
    });
  }

  await ensureCredentialAccount(
    prisma,
    {
      userId:
        demo.id,

      password:
        demoPassword
    }
  );

  await prisma.workspaceMembership.upsert({
    where: {
      workspaceId_userId: {
        workspaceId:
          workspaces.demo.id,

        userId:
          demo.id
      }
    },

    update: {
      role:
        'SUPER_ADMIN',

      active:
        true
    },

    create: {
      workspaceId:
        workspaces.demo.id,

      userId:
        demo.id,

      role:
        'SUPER_ADMIN',

      active:
        true
    }
  });

  console.log(
    `Demo Super Admin ready: ${DEMO_EMAIL}`
  );
}

export async function seedAdminAccounts(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
): Promise<void> {
  await seedDeveloperAdmin(
    prisma,
    workspaces
  );

  await seedDemoAdmin(
    prisma,
    workspaces
  );
}
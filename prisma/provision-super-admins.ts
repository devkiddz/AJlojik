import 'dotenv/config';

import { randomUUID } from 'node:crypto';

import { hashPassword } from 'better-auth/crypto';

import { prisma } from './seeds/seed-utils';

type AdminSpec = {
  email: string;
  password: string;
  name: string;
  ghost: boolean;
  aliases?: string[];
};

async function ensureCredentialAccount(
  userId: string,
  password: string
): Promise<void> {
  const passwordHash = await hashPassword(password);

  const existingAccount = await prisma.account.findFirst({
    where: {
      userId,
      providerId: 'credential'
    },

    select: {
      id: true
    }
  });

  if (existingAccount) {
    await prisma.account.update({
      where: {
        id: existingAccount.id
      },

      data: {
        accountId: userId,
        password: passwordHash
      }
    });

    return;
  }

  await prisma.account.create({
    data: {
      id: randomUUID(),
      accountId: userId,
      providerId: 'credential',
      userId,
      password: passwordHash
    }
  });
}

async function ensureIdentity(
  spec: AdminSpec
): Promise<string> {
  let user = await prisma.user.findUnique({
    where: {
      email: spec.email
    },

    select: {
      id: true
    }
  });

  if (!user && spec.aliases?.length) {
    user = await prisma.user.findFirst({
      where: {
        email: {
          in: spec.aliases
        }
      },

      select: {
        id: true
      }
    });
  }

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: spec.name,
        email: spec.email,
        emailVerified: true,
        tier: 'member',
        accountState: 'ACTIVE',
        lockedUntil: null,
        restrictionReason: null,
        isGhostDeveloper: spec.ghost
      },

      select: {
        id: true
      }
    });
  } else {
    await prisma.user.update({
      where: {
        id: user.id
      },

      data: {
        name: spec.name,
        email: spec.email,
        emailVerified: true,
        accountState: 'ACTIVE',
        lockedUntil: null,
        restrictionReason: null,
        isGhostDeveloper: spec.ghost
      }
    });
  }

  await ensureCredentialAccount(
    user.id,
    spec.password
  );

  await prisma.session.deleteMany({
    where: {
      userId: user.id
    }
  });

  return user.id;
}

async function main(): Promise<void> {
  const developerPassword =
    process.env.DEVELOPER_SUPER_ADMIN_PASSWORD;

  const adminPassword =
    process.env.AJLOJIK_SUPER_ADMIN_PASSWORD;

  if (!developerPassword || !adminPassword) {
    throw new Error(
      'DEVELOPER_SUPER_ADMIN_PASSWORD and AJLOJIK_SUPER_ADMIN_PASSWORD are required.'
    );
  }

  const liveWorkspace =
    await prisma.workspace.findUniqueOrThrow({
      where: {
        slug: 'aj-logik-live'
      },

      select: {
        id: true
      }
    });

  const developerId = await ensureIdentity({
    email: 'developer@rcentzlab.com',
    password: developerPassword,
    name: 'RcentzLab Developer',
    ghost: true,
    aliases: [
      'devkiddzadmin@recentzadmin.com'
    ]
  });

  const adminId = await ensureIdentity({
    email: 'admin@ajlojik.com',
    password: adminPassword,
    name: 'AJ Logik Super Admin',
    ghost: false
  });

  for (const userId of [
    developerId,
    adminId
  ]) {
    await prisma.workspaceMembership.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: liveWorkspace.id,
          userId
        }
      },

      update: {
        role: 'SUPER_ADMIN',
        active: true
      },

      create: {
        workspaceId: liveWorkspace.id,
        userId,
        role: 'SUPER_ADMIN',
        active: true
      }
    });
  }

  console.log(
    'Developer and AJ Logik Super Admin accounts are ready.'
  );
}

async function run(): Promise<void> {
  try {
    await main();
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void run();
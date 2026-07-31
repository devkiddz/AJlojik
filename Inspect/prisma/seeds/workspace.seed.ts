import {
  PrismaClient,
  WorkspaceMode
} from '../../lib/generated/prisma/client';

export type SeededWorkspace = {
  id: string;
  slug: string;
  name: string;
  mode: WorkspaceMode;
};

export type SeededWorkspaces = {
  live: SeededWorkspace;
  demo: SeededWorkspace;
  practice: SeededWorkspace;
};

export async function seedWorkspaces(prisma: PrismaClient) {
  console.log('Seeding RCENTZ workspaces...');

  const live = await prisma.workspace.upsert({
    where: {
      slug: 'aj-logik-live'
    },
    update: {
      name: 'AJ Logik Live',
      mode: 'LIVE',
      active: true,
      resettable: false,
      expiresAt: null
    },
    create: {
      slug: 'aj-logik-live',
      name: 'AJ Logik Live',
      mode: 'LIVE',
      active: true,
      resettable: false
    },
    select: {
      id: true,
      slug: true,
      name: true,
      mode: true
    }
  });

  const demo = await prisma.workspace.upsert({
    where: {
      slug: 'aj-logik-demo'
    },
    update: {
      name: 'AJ Logik Demo',
      mode: 'DEMO',
      active: true,
      resettable: true,
      expiresAt: null
    },
    create: {
      slug: 'aj-logik-demo',
      name: 'AJ Logik Demo',
      mode: 'DEMO',
      active: true,
      resettable: true
    },
    select: {
      id: true,
      slug: true,
      name: true,
      mode: true
    }
  });

  const practice = await prisma.workspace.upsert({
    where: {
      slug: 'aj-logik-practice'
    },
    update: {
      name: 'AJ Logik Practice',
      mode: 'PRACTICE',
      active: true,
      resettable: true,
      expiresAt: null
    },
    create: {
      slug: 'aj-logik-practice',
      name: 'AJ Logik Practice',
      mode: 'PRACTICE',
      active: true,
      resettable: true
    },
    select: {
      id: true,
      slug: true,
      name: true,
      mode: true
    }
  });

  console.log('RCENTZ workspaces ready.');

  return {
    live,
    demo,
    practice
  };
}
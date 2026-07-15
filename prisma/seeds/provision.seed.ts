import type {
  DemoProvisionStatus,
  PrismaClient
} from '../../lib/generated/prisma/client';

import type { SeededWorkspaces } from './workspace.seed';

type ProvisionSeed = {
  workspaceId: string;
  scenarioSlug: string;
  status: DemoProvisionStatus;
  seededRecords: number;
};

export async function seedProvisions(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
) {
  console.log('Creating demo provision records...');

  const scenarioSlugs = [
    'aj-logik-demo',
    'practice-mode'
  ] as const;

  const scenarios = await prisma.demoScenario.findMany({
    where: {
      slug: {
        in: [...scenarioSlugs]
      }
    },
    select: {
      id: true,
      slug: true
    }
  });

  const scenarioMap = new Map(
    scenarios.map(scenario => [scenario.slug, scenario.id])
  );

  const demoScenarioId = scenarioMap.get('aj-logik-demo');
  const practiceScenarioId = scenarioMap.get('practice-mode');

  if (!demoScenarioId) {
    throw new Error('Demo scenario "aj-logik-demo" was not found.');
  }

  if (!practiceScenarioId) {
    throw new Error('Practice scenario "practice-mode" was not found.');
  }

  const provisions: ProvisionSeed[] = [
    {
      workspaceId: workspaces.demo.id,
      scenarioSlug: 'aj-logik-demo',
      status: 'COMPLETED',
      seededRecords: 0
    },
    {
      workspaceId: workspaces.practice.id,
      scenarioSlug: 'practice-mode',
      status: 'COMPLETED',
      seededRecords: 0
    }
  ];

  for (const provision of provisions) {
    const scenarioId = scenarioMap.get(provision.scenarioSlug);

    if (!scenarioId) {
      throw new Error(
        `Scenario "${provision.scenarioSlug}" was not found.`
      );
    }

    const existing = await prisma.demoProvision.findFirst({
      where: {
        workspaceId: provision.workspaceId,
        scenarioId
      },
      select: {
        id: true
      }
    });

    if (existing) {
      await prisma.demoProvision.update({
        where: {
          id: existing.id
        },
        data: {
          status: provision.status,
          seededRecords: provision.seededRecords,
          completedAt: new Date(),
          metadata: {
            source: 'seed-engine',
            version: '0.1'
          }
        }
      });

      continue;
    }

    await prisma.demoProvision.create({
      data: {
        workspaceId: provision.workspaceId,
        scenarioId,
        status: provision.status,
        seededRecords: provision.seededRecords,
        completedAt: new Date(),
        metadata: {
          source: 'seed-engine',
          version: '0.1'
        }
      }
    });
  }

  console.log(`✓ ${provisions.length} workspace provisions ready.`);
}
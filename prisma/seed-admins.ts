import 'dotenv/config';

import { seedAdminAccounts } from './seeds/admin.seed';
import { prisma } from './seeds/seed-utils';

async function main() {
  const [live, demo, practice] = await Promise.all([
    prisma.workspace.findUniqueOrThrow({ where: { slug: 'aj-logik-live' }, select: { id: true, slug: true, name: true, mode: true } }),
    prisma.workspace.findUniqueOrThrow({ where: { slug: 'aj-logik-demo' }, select: { id: true, slug: true, name: true, mode: true } }),
    prisma.workspace.findUniqueOrThrow({ where: { slug: 'aj-logik-practice' }, select: { id: true, slug: true, name: true, mode: true } })
  ]);

  await seedAdminAccounts(prisma, { live, demo, practice });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async error => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

import HomeStorefront from '@/components/home/HomeStorefront';
import { prisma } from '@/lib/prisma';

export default async function HomeRoute() {
  const hero = await prisma.storefrontHero.findFirst({ where: { enabled: true, workspace: { mode: 'LIVE', active: true } }, orderBy: { updatedAt: 'desc' } }).catch(() => null);
  return (
    <div>
      <HomeStorefront hero={hero} />
    </div>
  );
}

//  <HeroComponent />;

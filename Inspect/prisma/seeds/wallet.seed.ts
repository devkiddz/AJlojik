import type { PrismaClient } from '../../lib/generated/prisma/client';
import type { SeededWorkspaces } from './workspace.seed';

type WalletSeedResult = {
  demoWallets: number;
  practiceWallets: number;
};

export async function seedWallets(
  prisma: PrismaClient,
  workspaces: SeededWorkspaces
): Promise<WalletSeedResult> {
  console.log('Provisioning paper wallets...');

  const users = await prisma.user.findMany({
    select: {
      id: true
    }
  });

  let demoWallets = 0;
  let practiceWallets = 0;

  for (const user of users) {
    await prisma.demoWallet.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspaces.demo.id,
          userId: user.id
        }
      },
      update: {
        currency: 'NGN',
        balance: 1_000_000,
        active: true
      },
      create: {
        workspaceId: workspaces.demo.id,
        userId: user.id,
        currency: 'NGN',
        balance: 1_000_000,
        active: true
      }
    });

    demoWallets += 1;

    await prisma.demoWallet.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: workspaces.practice.id,
          userId: user.id
        }
      },
      update: {
        currency: 'NGN',
        balance: 500_000,
        active: true
      },
      create: {
        workspaceId: workspaces.practice.id,
        userId: user.id,
        currency: 'NGN',
        balance: 500_000,
        active: true
      }
    });

    practiceWallets += 1;
  }

  console.log(
    `✓ ${demoWallets} demo wallets and ${practiceWallets} practice wallets ready.`
  );

  return {
    demoWallets,
    practiceWallets
  };
}
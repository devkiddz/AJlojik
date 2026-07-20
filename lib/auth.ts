import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';

import { prisma } from '@/lib/prisma';

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),

  emailAndPassword: {
    enabled: true
  },

  user: {
    additionalFields: {
      tier: {
        type: 'string',
        required: false,
        defaultValue: 'member',
        input: false
      },
      accountState: {
        type: 'string', required: false, defaultValue: 'ACTIVE', input: false
      },
      lockedUntil: {
        type: 'date', required: false, input: false
      },
      restrictionReason: {
        type: 'string', required: false, input: false
      },
      isGhostDeveloper: {
        type: 'boolean', required: false, defaultValue: false, input: false
      }
    }
  },

  databaseHooks: {
    session: {
      create: {
        before: async session => {
          const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { accountState: true, lockedUntil: true, restrictionReason: true } });
          if (!user) return false;

          if (user.accountState === 'LOCKED' && user.lockedUntil && user.lockedUntil <= new Date()) {
            await prisma.user.update({ where: { id: session.userId }, data: { accountState: 'ACTIVE', lockedUntil: null, restrictionReason: null } });
            return;
          }

          if (user.accountState === 'BANNED' || user.accountState === 'LOCKED') {
            throw new APIError('FORBIDDEN', { message: user.restrictionReason || 'This account is currently unavailable.' });
          }
        }
      }
    }
  }
});

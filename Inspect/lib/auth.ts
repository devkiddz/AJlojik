import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { APIError } from 'better-auth/api';

import {
  buildEmailVerificationTemplate,
  buildPasswordResetTemplate,
  isAuthEmailEnabled,
  queueTransactionalEmail,
  sendTransactionalEmail
} from '@/lib/email';
import { prisma } from '@/lib/prisma';

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const authEmailEnabled = isAuthEmailEnabled();

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,

  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    requireEmailVerification: authEmailEnabled,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url, token }) => {
      if (!authEmailEnabled) return;

      const template = buildPasswordResetTemplate({
        name: user.name,
        actionUrl: url
      });

      console.info('[auth-email] Sending verification email to:', user.email);

      await sendTransactionalEmail({
        to: user.email,
        ...template,
        category: 'email_verification',
        idempotencyKey: `email-verification-${token}`
      });
    }
  },

  emailVerification: {
    sendOnSignUp: authEmailEnabled,
    sendOnSignIn: authEmailEnabled,
    autoSignInAfterVerification: true,
    expiresIn: 60 * 60,
    sendVerificationEmail: async ({ user, url, token }) => {
      if (!authEmailEnabled) return;

      const template = buildEmailVerificationTemplate({
        name: user.name,
        actionUrl: url
      });

      queueTransactionalEmail(() =>
        sendTransactionalEmail({
          to: user.email,
          ...template,
          category: 'email_verification',
          idempotencyKey: `email-verification-${token}`
        })
      );
    }
  },

  socialProviders: googleClientId && googleClientSecret ? {
    google: {
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      prompt: 'select_account'
    }
  } : {},

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
      },
      platformRole: {
        type: 'string', required: false, defaultValue: 'STANDARD', input: false
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

import 'server-only';

type TransactionalEmailConfig = {
  apiKey: string;
  from: string;
  replyTo?: string;
};

export function isAuthEmailEnabled(): boolean {
  return (
    process.env.AUTH_EMAIL_ENABLED === 'true' &&
    Boolean(process.env.RESEND_API_KEY?.trim()) &&
    Boolean(process.env.AUTH_EMAIL_FROM?.trim())
  );
}

export function getTransactionalEmailConfig(): TransactionalEmailConfig {
  if (!isAuthEmailEnabled()) {
    throw new Error(
      'Authentication email is not configured. Set AUTH_EMAIL_ENABLED, RESEND_API_KEY and AUTH_EMAIL_FROM.'
    );
  }

  return {
    apiKey: process.env.RESEND_API_KEY!.trim(),
    from: process.env.AUTH_EMAIL_FROM!.trim(),
    replyTo: process.env.AUTH_EMAIL_REPLY_TO?.trim() || undefined
  };
}

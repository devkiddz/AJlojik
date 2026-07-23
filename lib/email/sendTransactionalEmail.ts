import 'server-only';

import { getTransactionalEmailConfig } from './emailConfig';
import type {
  SendTransactionalEmailInput,
  SendTransactionalEmailResult
} from './emailTypes';

const RESEND_EMAIL_ENDPOINT = 'https://api.resend.com/emails';

export async function sendTransactionalEmail({
  to,
  subject,
  html,
  text,
  category,
  idempotencyKey
}: SendTransactionalEmailInput): Promise<SendTransactionalEmailResult> {
  const config = getTransactionalEmailConfig();

  const response = await fetch(RESEND_EMAIL_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'AJ-Logik/1.0',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {})
    },
    body: JSON.stringify({
      from: config.from,
      to: [to],
      subject,
      html,
      text,
      ...(config.replyTo ? { reply_to: config.replyTo } : {}),
      tags: [
        {
          name: 'category',
          value: category
        }
      ]
    }),
    cache: 'no-store'
  });

  const payload = (await response.json().catch(() => null)) as
    | { id?: string; message?: string; name?: string }
    | null;

  if (!response.ok || !payload?.id) {
    const reason = payload?.message ?? payload?.name ?? `Resend returned ${response.status}`;
    throw new Error(`Transactional email failed: ${reason}`);
  }

  return { id: payload.id };
}

const PAYSTACK_API_URL = 'https://api.paystack.co';

type PaystackEnvelope<T> = {
  status: boolean;
  message: string;
  data: T;
};

export type PaystackInitialization = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

export type PaystackTransaction = {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  requested_amount?: number | null;
  fees?: number | null;
  currency: string;
  paid_at?: string | null;
  paidAt?: string | null;
  channel?: string | null;
  gateway_response?: string | null;
  customer?: {
    email?: string | null;
  } | null;
};

export class PaystackConfigurationError extends Error {}

function getTestSecretKey() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();

  if (!secretKey || !secretKey.startsWith('sk_test_')) {
    throw new PaystackConfigurationError(
      'Paystack test mode is not configured. Add a PAYSTACK_SECRET_KEY that begins with sk_test_.'
    );
  }

  return secretKey;
}

async function paystackRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PAYSTACK_API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getTestSecretKey()}`,
      'Content-Type': 'application/json',
      ...init?.headers
    },
    cache: 'no-store'
  });

  const payload = (await response.json()) as PaystackEnvelope<T>;

  if (!response.ok || !payload.status) {
    throw new Error(payload.message || 'Paystack could not complete the request.');
  }

  return payload.data;
}

export function initializePaystackTransaction(input: {
  email: string;
  amountKobo: number;
  reference: string;
  callbackUrl: string;
  metadata: Record<string, unknown>;
}) {
  return paystackRequest<PaystackInitialization>('/transaction/initialize', {
    method: 'POST',
    body: JSON.stringify({
      email: input.email,
      amount: String(input.amountKobo),
      currency: 'NGN',
      reference: input.reference,
      callback_url: input.callbackUrl,
      channels: ['card', 'bank', 'ussd', 'bank_transfer'],
      metadata: input.metadata
    })
  });
}

export function verifyPaystackTransaction(reference: string) {
  return paystackRequest<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function readPaystackTestSecret() {
  return getTestSecretKey();
}

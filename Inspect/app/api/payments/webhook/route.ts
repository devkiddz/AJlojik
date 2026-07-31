import { createHmac, timingSafeEqual } from 'node:crypto';

import { NextResponse } from 'next/server';

import { settleVerifiedPayment } from '@/features/payments/server/paymentSettlement';
import { readPaystackTestSecret, verifyPaystackTransaction } from '@/features/payments/server/paystack';

type PaystackWebhook = {
  event?: string;
  data?: {
    reference?: string;
  };
};

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const suppliedSignature = request.headers.get('x-paystack-signature') ?? '';
    const expectedSignature = createHmac('sha512', readPaystackTestSecret()).update(rawBody).digest('hex');
    const supplied = Buffer.from(suppliedSignature, 'utf8');
    const expected = Buffer.from(expectedSignature, 'utf8');

    if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
      return NextResponse.json({ error: 'Invalid webhook signature.' }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as PaystackWebhook;

    if (event.event === 'charge.success' && event.data?.reference) {
      const transaction = await verifyPaystackTransaction(event.data.reference);
      await settleVerifiedPayment(event.data.reference, transaction);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Paystack webhook failed:', error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}

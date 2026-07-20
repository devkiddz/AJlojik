import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { settleVerifiedPayment } from '@/features/payments/server/paymentSettlement';
import { verifyPaystackTransaction } from '@/features/payments/server/paystack';

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

    const reference = new URL(request.url).searchParams.get('reference')?.trim();
    if (!reference) return NextResponse.json({ error: 'Payment reference is required.' }, { status: 400 });

    const payment = await prisma.payment.findUnique({
      where: { reference },
      include: { order: { select: { userId: true, orderNumber: true } } }
    });

    if (!payment || payment.order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Payment was not found.' }, { status: 404 });
    }

    if (payment.provider === 'paper-wallet' && payment.status === 'PAID') {
      return NextResponse.json({
        reference,
        orderNumber: payment.order.orderNumber,
        status: 'PAID',
        alreadyProcessed: true
      });
    }

    const transaction = await verifyPaystackTransaction(reference);
    const result = await settleVerifiedPayment(reference, transaction);

    return NextResponse.json({ ...result, reference });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to verify this payment.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

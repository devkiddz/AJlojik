import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) return NextResponse.json({ error: 'Authentication is required.' }, { status: 401 });

  const workspaceId = new URL(request.url).searchParams.get('workspaceId')?.trim();
  if (!workspaceId) return NextResponse.json({ error: 'workspaceId is required.' }, { status: 400 });

  const membership = await prisma.workspaceMembership.findFirst({
    where: { workspaceId, userId: session.user.id, active: true },
    select: { id: true }
  });
  if (!membership) return NextResponse.json({ error: 'Workspace access is required.' }, { status: 403 });

  const payments = await prisma.payment.findMany({
    where: {
      order: {
        userId: session.user.id,
        workspaceId
      }
    },
    include: {
      order: {
        select: {
          orderNumber: true,
          status: true,
          paymentStatus: true,
          total: true,
          createdAt: true,
          delivery: { select: { trackingCode: true, method: true, status: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 12
  });

  return NextResponse.json({
    payments: payments.map(payment => ({
      id: payment.id,
      reference: payment.reference,
      provider: payment.provider,
      amount: Number(payment.amount),
      status: payment.status,
      paidAt: payment.paidAt?.toISOString() ?? null,
      createdAt: payment.createdAt.toISOString(),
      order: {
        ...payment.order,
        total: Number(payment.order.total),
        createdAt: payment.order.createdAt.toISOString()
      }
    }))
  });
}

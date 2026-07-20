import { randomUUID } from 'node:crypto';

import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import type { Prisma } from '@/lib/generated/prisma/client';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import {
  initializePaystackTransaction,
  PaystackConfigurationError,
  readPaystackTestSecret
} from '@/features/payments/server/paystack';

const DELIVERY_FEES = {
  AJ_DELIVERY: 2_500,
  PERSONAL_COURIER: 0,
  STORE_PICKUP: 0
} as const;

type DeliveryMethod = keyof typeof DELIVERY_FEES;

type CheckoutPayload = {
  workspaceId?: unknown;
  deliveryMethod?: unknown;
  recipientName?: unknown;
  phone?: unknown;
  addressLine1?: unknown;
  addressLine2?: unknown;
  city?: unknown;
  state?: unknown;
  notes?: unknown;
  saveAddress?: unknown;
};

class CheckoutError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

function text(value: unknown, maximumLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maximumLength) : '';
}

function parsePayload(payload: CheckoutPayload) {
  const workspaceId = text(payload.workspaceId, 100);
  const deliveryMethod = text(payload.deliveryMethod, 30) as DeliveryMethod;
  const recipientName = text(payload.recipientName, 120);
  const phone = text(payload.phone, 40);
  const addressLine1 = text(payload.addressLine1, 240);
  const addressLine2 = text(payload.addressLine2, 240);
  const city = text(payload.city, 100);
  const state = text(payload.state, 100);
  const notes = text(payload.notes, 500);

  if (!workspaceId) throw new CheckoutError('Select a shopping workspace before checkout.');
  if (!(deliveryMethod in DELIVERY_FEES)) throw new CheckoutError('Select a valid delivery method.');
  if (!recipientName || !phone) throw new CheckoutError('Recipient name and phone number are required.');

  if (deliveryMethod !== 'STORE_PICKUP' && (!addressLine1 || !city || !state)) {
    throw new CheckoutError('Delivery address, city and state are required.');
  }

  return {
    workspaceId,
    deliveryMethod,
    recipientName,
    phone,
    addressLine1,
    addressLine2,
    city,
    state,
    notes,
    saveAddress: payload.saveAddress === true
  };
}

function reference(prefix: string) {
  return `${prefix}-${Date.now()}-${randomUUID().replaceAll('-', '').slice(0, 10)}`;
}

export async function POST(request: Request) {
  let pendingPaymentReference: string | null = null;

  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user?.id) throw new CheckoutError('Sign in before starting checkout.', 401);

    const input = parsePayload((await request.json()) as CheckoutPayload);
    const membership = await prisma.workspaceMembership.findFirst({
      where: {
        userId: session.user.id,
        workspaceId: input.workspaceId,
        active: true,
        workspace: { active: true }
      },
      include: { workspace: true }
    });

    if (!membership) throw new CheckoutError('You do not have access to this shopping workspace.', 403);

    // Fail before creating an order when test-mode credentials are absent.
    if (membership.workspace.mode === 'LIVE') readPaystackTestSecret();

    const cart = await prisma.cart.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: input.workspaceId,
          userId: session.user.id
        }
      },
      include: {
        items: {
          include: {
            product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } },
            variant: { include: { inventory: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!cart?.items.length) throw new CheckoutError('Your cart is empty. Add a product before checkout.', 409);

    for (const item of cart.items) {
      if (!item.product.active || !item.variant.active) {
        throw new CheckoutError(`${item.product.name} is no longer available.`, 409);
      }

      if (item.variant.inventory) {
        const available = Math.max(item.variant.inventory.quantity - item.variant.inventory.reserved, 0);
        if (item.quantity > available) {
          throw new CheckoutError(`Only ${available} unit(s) of ${item.product.name} remain available.`, 409);
        }
      }
    }

    const subtotal = cart.items.reduce((total, item) => total + Number(item.variant.price) * item.quantity, 0);
    const deliveryFee = DELIVERY_FEES[input.deliveryMethod];
    const total = subtotal + deliveryFee;
    const paymentReference = reference('AJT');
    const orderNumber = reference('AJ');
    const trackingCode = reference('AJD');
    pendingPaymentReference = paymentReference;
    const dataSource = membership.workspace.mode === 'LIVE' ? 'REAL' : 'SYNTHETIC';
    const address: Prisma.InputJsonValue = input.deliveryMethod === 'STORE_PICKUP'
      ? {
          recipientName: input.recipientName,
          phone: input.phone,
          fulfilment: 'STORE_PICKUP'
        }
      : {
          recipientName: input.recipientName,
          phone: input.phone,
          addressLine1: input.addressLine1,
          addressLine2: input.addressLine2 || null,
          city: input.city,
          state: input.state,
          country: 'Nigeria'
        };

    const result = await prisma.$transaction(async transaction => {
      const order = await transaction.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          workspaceId: input.workspaceId,
          mode: membership.workspace.mode,
          dataSource,
          subtotal,
          deliveryFee,
          total,
          deliveryAddress: address,
          notes: input.notes || null,
          items: {
            create: cart.items.map(item => ({
              productId: item.productId,
              variantId: item.variantId,
              productName: item.product.name,
              variantLabel: item.variant.label,
              image: item.variant.image ?? item.product.images[0]?.url ?? null,
              quantity: item.quantity,
              unitPrice: Number(item.variant.price),
              totalPrice: Number(item.variant.price) * item.quantity
            }))
          }
        }
      });

      await transaction.delivery.create({
        data: {
          workspaceId: input.workspaceId,
          orderId: order.id,
          method: input.deliveryMethod,
          trackingCode,
          dispatcherName: input.deliveryMethod === 'PERSONAL_COURIER' ? 'Customer-appointed courier' : null
        }
      });

      if (input.saveAddress && input.deliveryMethod !== 'STORE_PICKUP') {
        await transaction.address.create({
          data: {
            userId: session.user.id,
            label: 'Checkout address',
            recipientName: input.recipientName,
            phone: input.phone,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2 || null,
            city: input.city,
            state: input.state,
            country: 'Nigeria'
          }
        });
      }

      await transaction.experienceEvent.create({
        data: {
          workspaceId: input.workspaceId,
          userId: session.user.id,
          type: 'CHECKOUT_STARTED',
          source: 'checkout',
          dataSource,
          metadata: { orderId: order.id, orderNumber, deliveryMethod: input.deliveryMethod }
        }
      });

      if (membership.workspace.mode !== 'LIVE') {
        const walletUpdate = await transaction.demoWallet.updateMany({
          where: {
            workspaceId: input.workspaceId,
            userId: session.user.id,
            active: true,
            balance: { gte: total }
          },
          data: { balance: { decrement: total } }
        });

        if (walletUpdate.count !== 1) throw new CheckoutError('Your paper wallet balance is too low.', 409);

        await transaction.payment.create({
          data: {
            orderId: order.id,
            provider: 'paper-wallet',
            reference: paymentReference,
            amount: total,
            status: 'PAID',
            paidAt: new Date(),
            metadata: { workspaceMode: membership.workspace.mode, testPayment: true }
          }
        });

        await transaction.order.update({
          where: { id: order.id },
          data: { status: 'CONFIRMED', paymentStatus: 'PAID' }
        });

        await transaction.cartItem.deleteMany({ where: { cartId: cart.id } });
        await transaction.experienceEvent.create({
          data: {
            workspaceId: input.workspaceId,
            userId: session.user.id,
            type: 'PAYMENT_COMPLETED',
            source: 'paper-wallet',
            dataSource,
            metadata: { orderId: order.id, reference: paymentReference }
          }
        });

        return { order, paper: true };
      }

      await transaction.payment.create({
        data: {
          orderId: order.id,
          provider: 'paystack-test',
          reference: paymentReference,
          amount: total,
          status: 'PROCESSING',
          metadata: { testPayment: true, deliveryMethod: input.deliveryMethod }
        }
      });

      await transaction.experienceEvent.create({
        data: {
          workspaceId: input.workspaceId,
          userId: session.user.id,
          type: 'PAYMENT_STARTED',
          source: 'paystack-test',
          metadata: { orderId: order.id, reference: paymentReference }
        }
      });

      return { order, paper: false };
    });

    if (result.paper) {
      return NextResponse.json({
        reference: paymentReference,
        orderNumber,
        status: 'PAID',
        paper: true
      });
    }

    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL?.trim() || new URL('/payments', request.url).toString();
    const initialized = await initializePaystackTransaction({
      email: session.user.email,
      amountKobo: Math.round(total * 100),
      reference: paymentReference,
      callbackUrl,
      metadata: {
        orderId: result.order.id,
        orderNumber,
        workspaceId: input.workspaceId,
        testMode: true
      }
    });

    await prisma.payment.update({
      where: { reference: paymentReference },
      data: {
        metadata: {
          testPayment: true,
          accessCode: initialized.access_code,
          deliveryMethod: input.deliveryMethod
        }
      }
    });

    return NextResponse.json({
      reference: initialized.reference,
      authorizationUrl: initialized.authorization_url,
      orderNumber,
      status: 'PROCESSING',
      paper: false
    });
  } catch (error) {
    if (pendingPaymentReference) {
      await prisma.payment.updateMany({
        where: { reference: pendingPaymentReference, status: { not: 'PAID' } },
        data: { status: 'FAILED' }
      }).catch(() => undefined);
    }

    const status = error instanceof CheckoutError
      ? error.status
      : error instanceof PaystackConfigurationError
        ? 503
        : 500;
    const message = error instanceof CheckoutError || error instanceof PaystackConfigurationError
      ? error.message
      : 'Checkout could not be completed. Please try again.';

    if (status === 500) console.error('Checkout failed:', error);

    return NextResponse.json({ error: message }, { status });
  }
}

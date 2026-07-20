import type { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

import type { PaystackTransaction } from './paystack';

function providerMetadata(transaction: PaystackTransaction): Prisma.InputJsonValue {
  return {
    transactionId: String(transaction.id),
    domain: transaction.domain,
    channel: transaction.channel ?? null,
    gatewayResponse: transaction.gateway_response ?? null,
    currency: transaction.currency,
    verifiedAt: new Date().toISOString()
  };
}

export async function settleVerifiedPayment(reference: string, transaction: PaystackTransaction) {
  const payment = await prisma.payment.findUnique({
    where: { reference },
    include: {
      order: {
        include: {
          items: true
        }
      }
    }
  });

  if (!payment) {
    throw new Error('The payment reference is not attached to an AJ Logik order.');
  }

  const expectedAmountKobo = Math.round(Number(payment.amount) * 100);
  const successful = transaction.status === 'success';
  const correctAmount = transaction.amount === expectedAmountKobo;
  const correctCurrency = transaction.currency === 'NGN';
  const correctReference = transaction.reference === payment.reference;

  if (!successful || !correctAmount || !correctCurrency || !correctReference) {
    await prisma.payment.updateMany({
      where: {
        id: payment.id,
        status: { not: 'PAID' }
      },
      data: {
        status: successful ? 'FAILED' : transaction.status === 'failed' ? 'FAILED' : 'PROCESSING',
        metadata: providerMetadata(transaction)
      }
    });

    throw new Error(
      successful && !correctAmount
        ? 'The verified payment amount does not match this order.'
        : 'Paystack has not confirmed this payment as successful.'
    );
  }

  const paidAtValue = transaction.paid_at ?? transaction.paidAt;
  const paidAt = paidAtValue ? new Date(paidAtValue) : new Date();

  const applied = await prisma.$transaction(async transactionClient => {
    const claim = await transactionClient.payment.updateMany({
      where: {
        id: payment.id,
        status: { not: 'PAID' }
      },
      data: {
        status: 'PAID',
        paidAt,
        metadata: providerMetadata(transaction)
      }
    });

    if (claim.count === 0) return false;

    for (const item of payment.order.items) {
      const inventory = await transactionClient.inventory.findUnique({
        where: { variantId: item.variantId },
        select: { id: true }
      });

      if (inventory) {
        const stockUpdate = await transactionClient.inventory.updateMany({
          where: {
            id: inventory.id,
            quantity: { gte: item.quantity }
          },
          data: {
            quantity: { decrement: item.quantity }
          }
        });

        if (stockUpdate.count !== 1) {
          throw new Error(`${item.productName} no longer has enough stock to complete this order.`);
        }

        await transactionClient.stockMovement.create({
          data: {
            inventoryId: inventory.id,
            type: 'SALE',
            quantity: -item.quantity,
            reason: 'Paystack payment completed',
            reference: payment.reference
          }
        });
      }

      await transactionClient.product.update({
        where: { id: item.productId },
        data: { soldCount: { increment: item.quantity } }
      });
    }

    await transactionClient.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: 'PAID',
        status: 'CONFIRMED'
      }
    });

    await transactionClient.cartItem.deleteMany({
      where: {
        cart: {
          userId: payment.order.userId,
          workspaceId: payment.order.workspaceId
        }
      }
    });

    await transactionClient.experienceEvent.createMany({
      data: [
        {
          workspaceId: payment.order.workspaceId,
          userId: payment.order.userId,
          type: 'PAYMENT_COMPLETED',
          source: 'paystack',
          metadata: { reference: payment.reference, orderId: payment.orderId }
        },
        {
          workspaceId: payment.order.workspaceId,
          userId: payment.order.userId,
          type: 'ORDER_COMPLETED',
          source: 'checkout',
          metadata: { reference: payment.reference, orderId: payment.orderId }
        }
      ]
    });

    return true;
  });

  return {
    applied,
    paymentId: payment.id,
    orderId: payment.orderId,
    orderNumber: payment.order.orderNumber,
    status: 'PAID' as const
  };
}

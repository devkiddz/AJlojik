'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

const text = (data: FormData, key: string) => String(data.get(key) ?? '').trim();

export async function adjustInventory(formData: FormData) {
  const access = await requireAdminPermission('inventory:manage');
  const variantId = text(formData, 'variantId');
  const operation = text(formData, 'operation');
  const amount = Math.max(Math.round(Number(text(formData, 'amount')) || 0), 0);
  const reason = text(formData, 'reason') || null;
  if (!variantId || !['ADD', 'REMOVE', 'SET'].includes(operation)) throw new Error('Variant and adjustment operation are required.');

  const variant = await prisma.productVariant.findFirst({
    where: { id: variantId, product: { workspaceId: access.membership.workspaceId } },
    include: { inventory: true, product: { select: { name: true } } }
  });
  if (!variant) throw new Error('The selected inventory variant was not found.');

  const current = variant.inventory?.quantity ?? 0;
  const next = operation === 'ADD' ? current + amount : operation === 'REMOVE' ? Math.max(current - amount, 0) : amount;
  const difference = next - current;

  await prisma.$transaction(async tx => {
    const inventory = await tx.inventory.upsert({
      where: { variantId },
      update: {
        quantity: next,
        reserved: Math.min(variant.inventory?.reserved ?? 0, next)
      },
      create: {
        variantId,
        quantity: next,
        reserved: 0,
        reorderLevel: access.membership.workspace.defaultLowStockLevel
      }
    });
    await tx.stockMovement.create({
      data: {
        inventoryId: inventory.id,
        type: 'ADJUSTMENT',
        quantity: difference,
        reason,
        reference: `ADMIN:${access.session.user.id}`
      }
    });
    await tx.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: 'STOCK_ADJUSTED',
        targetType: 'INVENTORY',
        targetId: inventory.id,
        summary: `${variant.product.name} · ${variant.label} stock changed from ${current} to ${next}.`,
        metadata: {
          operation,
          amount,
          difference,
          reason,
          previousReserved: variant.inventory?.reserved ?? 0,
          nextReserved: Math.min(variant.inventory?.reserved ?? 0, next)
        }
      }
    });
  });

  revalidatePath('/admin/inventory');
  revalidatePath('/admin/products');
  revalidatePath('/store');
}

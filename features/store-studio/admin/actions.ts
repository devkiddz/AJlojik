'use server';

import { randomUUID } from 'node:crypto';

import { revalidatePath } from 'next/cache';

import { requireAdminPermission } from '@/features/admin/auth/adminPermissions';
import { prisma } from '@/lib/prisma';

type ProductReelDraft = {
  productId: string;
  title: string;
  caption: string;
  videoUrl: string;
  posterUrl: string;
  autoplay: boolean;
};

export type CreateProductReelsResult = {
  ok: boolean;
  count: number;
  status: 'active';
  message: string;
};

const MAX_REELS_PER_BATCH = 6;

function isMediaReference(value: string): boolean {
  if (value.startsWith('/')) {
    return true;
  }

  try {
    const url = new URL(value);

    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

function parseDrafts(formData: FormData): ProductReelDraft[] {
  const rawDrafts = String(formData.get('entries') ?? '');

  let parsed: unknown;

  try {
    parsed = JSON.parse(rawDrafts);
  } catch {
    throw new Error('The Reel draft data is invalid.');
  }

  if (!Array.isArray(parsed)) {
    throw new Error('At least one Reel draft is required.');
  }

  const drafts = parsed
    .map(entry => {
      if (!entry || typeof entry !== 'object') {
        return null;
      }

      const record = entry as Record<string, unknown>;

      return {
        productId: String(record.productId ?? '').trim(),
        title: String(record.title ?? '').trim(),
        caption: String(record.caption ?? '').trim(),
        videoUrl: String(record.videoUrl ?? '').trim(),
        posterUrl: String(record.posterUrl ?? '').trim(),
        autoplay: record.autoplay !== false
      } satisfies ProductReelDraft;
    })
    .filter((entry): entry is ProductReelDraft => Boolean(entry));

  if (!drafts.length) {
    throw new Error('Select at least one product for the Reel campaign.');
  }

  if (drafts.length > MAX_REELS_PER_BATCH) {
    throw new Error(
      `A Reel campaign can contain up to ${MAX_REELS_PER_BATCH} products at once.`
    );
  }

  const productIds = new Set<string>();

  for (const draft of drafts) {
    if (!draft.productId || !draft.title || !draft.videoUrl) {
      throw new Error(
        'Every Reel requires a product, title, and video URL.'
      );
    }

    if (!isMediaReference(draft.videoUrl)) {
      throw new Error(
        `The video URL for “${draft.title}” is invalid.`
      );
    }

    if (
      draft.posterUrl &&
      !isMediaReference(draft.posterUrl)
    ) {
      throw new Error(
        `The poster URL for “${draft.title}” is invalid.`
      );
    }

    if (productIds.has(draft.productId)) {
      throw new Error(
        'Each product may appear only once in the same Reel batch.'
      );
    }

    productIds.add(draft.productId);
  }

  return drafts;
}

export async function createProductReels(
  formData: FormData
): Promise<CreateProductReelsResult> {
  const access = await requireAdminPermission(
    'approval:review'
  );

  const drafts = parseDrafts(formData);
  const requestedTitle = String(
    formData.get('campaignTitle') ?? ''
  ).trim();

  const products = await prisma.product.findMany({
    where: {
      workspaceId: access.membership.workspaceId,
      active: true,
      id: {
        in: drafts.map(draft => draft.productId)
      }
    },
    select: {
      id: true,
      name: true,
      shortDescription: true,
      images: {
        orderBy: {
          position: 'asc'
        },
        take: 1,
        select: {
          url: true
        }
      }
    }
  });

  if (products.length !== drafts.length) {
    throw new Error(
      'One or more selected products are no longer available in this workspace.'
    );
  }

  const productMap = new Map(
    products.map(product => [product.id, product])
  );

  const campaignId = randomUUID();
  const status = 'ACTIVE' as const;

  const campaignTitle =
    requestedTitle ||
    `Product Reels · ${new Intl.DateTimeFormat('en-NG', {
      dateStyle: 'medium'
    }).format(new Date())}`;

  await prisma.storeStudioCampaign.create({
    data: {
      id: campaignId,
      workspaceId: access.membership.workspaceId,
      type: 'REEL',
      status,
      placementTier: 'STANDARD',
      title: campaignTitle,
      description:
        'Product-linked Reels created from the AJ Logik storefront.',
      startsAt: new Date(),
      requestedPriority: 0,
      adminWeight: 0,
      active: true,

      assets: {
        create: drafts.map((draft, index) => {
          const product = productMap.get(draft.productId);
          const assetId = randomUUID();

          return {
            id: assetId,
            mediaType: 'VIDEO' as const,
            mediaUrl: draft.videoUrl,
            posterUrl:
              draft.posterUrl ||
              product?.images[0]?.url ||
              null,
            coverUrl:
              draft.posterUrl ||
              product?.images[0]?.url ||
              null,
            title: draft.title || product?.name || 'Store Reel',
            description:
              draft.caption ||
              product?.shortDescription ||
              null,
            actionLabel: 'Shop this Reel',
            actionHref: `/reels/${assetId}`,
            productId: draft.productId,
            autoplay: draft.autoplay,
            muted: true,
            position: index,
            active: true
          };
        })
      }
    }
  });

  await prisma.adminAuditEvent.create({
    data: {
      workspaceId: access.membership.workspaceId,
      actorId: access.session.user.id,
      action: 'STORE_STUDIO_PRODUCT_REELS_CREATED',
      targetType: 'EXPERIENCE',
      targetId: campaignId,
      summary: `${drafts.length} product Reel${drafts.length === 1 ? '' : 's'} created by ${access.session.user.name}.`,
      metadata: {
        campaignTitle,
        status,
        productIds: drafts.map(draft => draft.productId),
        reelCount: drafts.length
      }
    }
  });

  revalidatePath('/store');
  revalidatePath('/admin');

  return {
    ok: true,
    count: drafts.length,
    status: 'active',
    message: `${drafts.length} Reel${drafts.length === 1 ? '' : 's'} published to the Store.`
  };
}

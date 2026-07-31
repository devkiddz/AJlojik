import { NextResponse } from 'next/server';

import { getVendorApiAccess } from '@/features/vendor/auth/vendorAccess';
import {
  assertCloudinaryUploadResult,
  assertCloudinaryUploadSize,
  cloudinaryUploadFolder
} from '@/lib/cloudinary';
import type { Prisma } from '@/lib/generated/prisma/client';
import { prisma } from '@/lib/prisma';

type CloudinaryUploadResult = Prisma.InputJsonObject & {
  asset_id?: string;
  public_id?: string;
  secure_url?: string;
  resource_type?: string;
  format?: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes?: number;
  folder?: string;
  original_filename?: string;
  display_name?: string;
};

function resourceType(value: string | undefined) {
  return value === 'video' ? ('VIDEO' as const) : ('IMAGE' as const);
}

function normalizedBytes(value: number | undefined) {
  return Math.min(Math.max(Math.round(value ?? 0), 0), 2_147_483_647);
}

export async function POST(request: Request) {
  const access = await getVendorApiAccess(request.headers);

  if (!access) {
    return NextResponse.json(
      { error: 'Vendor authentication required.' },
      { status: 401 }
    );
  }

  if (!access.permissions.has('media:manage')) {
    return NextResponse.json(
      { error: 'Vendor media permission is required.' },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | { upload?: CloudinaryUploadResult; altText?: string }
    | null;
  const upload = body?.upload;

  if (!upload?.public_id || !upload.secure_url) {
    return NextResponse.json(
      { error: 'Upload metadata is incomplete.' },
      { status: 400 }
    );
  }

  const publicId = upload.public_id;
  const secureUrl = upload.secure_url;
  const metadata: Prisma.InputJsonObject = upload;

  try {
    const vendorRoot = cloudinaryUploadFolder({
      workspaceId: access.workspace.id,
      workspaceFolderPrefix: access.workspace.mediaFolderPrefix,
      ownerPath: `vendors/${access.vendor.slug}`,
      purpose: 'general'
    }).replace(/\/general$/, '');

    assertCloudinaryUploadResult(upload, vendorRoot);
    assertCloudinaryUploadSize(upload);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Cloudinary upload metadata is invalid.'
      },
      { status: 400 }
    );
  }

  const existing = await prisma.mediaAsset.findUnique({
    where: { publicId },
    select: { id: true, workspaceId: true, vendorProfileId: true }
  });

  if (
    existing &&
    (existing.workspaceId !== access.workspace.id ||
      existing.vendorProfileId !== access.vendor.id)
  ) {
    return NextResponse.json(
      { error: 'This Cloudinary asset is already registered outside your vendor gallery.' },
      { status: 409 }
    );
  }

  const data = {
    cloudinaryAssetId:
      typeof upload.asset_id === 'string' ? upload.asset_id : null,
    secureUrl,
    resourceType: resourceType(upload.resource_type),
    format: typeof upload.format === 'string' ? upload.format : null,
    width: typeof upload.width === 'number' ? upload.width : null,
    height: typeof upload.height === 'number' ? upload.height : null,
    duration: typeof upload.duration === 'number' ? upload.duration : null,
    bytes: normalizedBytes(upload.bytes),
    folder: typeof upload.folder === 'string' ? upload.folder : null,
    originalFilename:
      typeof upload.original_filename === 'string'
        ? upload.original_filename
        : null,
    displayName:
      typeof upload.display_name === 'string'
        ? upload.display_name
        : typeof upload.original_filename === 'string'
          ? upload.original_filename
          : null,
    altText: body?.altText?.trim() || null,
    status: 'ACTIVE' as const,
    metadata
  };

  const asset = await prisma.$transaction(async transaction => {
    const registered = existing
      ? await transaction.mediaAsset.update({
          where: { id: existing.id },
          data
        })
      : await transaction.mediaAsset.create({
          data: {
            ...data,
            workspaceId: access.workspace.id,
            uploadedById: access.session.user.id,
            vendorProfileId: access.vendor.id,
            publicId
          }
        });

    await transaction.adminAuditEvent.create({
      data: {
        workspaceId: access.workspace.id,
        actorId: access.session.user.id,
        action: existing ? 'VENDOR_MEDIA_UPDATED' : 'VENDOR_MEDIA_UPLOADED',
        targetType: 'MEDIA',
        targetId: registered.id,
        summary: `${access.vendor.name} ${existing ? 'updated' : 'uploaded'} ${registered.displayName ?? registered.publicId}.`,
        metadata: {
          vendorProfileId: access.vendor.id,
          resourceType: registered.resourceType,
          bytes: registered.bytes
        }
      }
    });

    return registered;
  });

  return NextResponse.json({ asset });
}

import { NextResponse } from 'next/server';

import { getAdminApiAccess } from '@/features/admin/auth/adminPermissions';
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

export async function GET(request: Request) {
  const access = await getAdminApiAccess(request.headers);

  if (!access) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!access.permissions.has('media:manage')) {
    return NextResponse.json(
      { error: 'Media management permission is required.' },
      { status: 403 }
    );
  }

  const url = new URL(request.url);
  const workspaceOnly = url.searchParams.get('scope') === 'workspace';

  const assets = await prisma.mediaAsset.findMany({
    where: {
      workspaceId: access.membership.workspaceId,
      status: 'ACTIVE',
      ...(workspaceOnly ? { vendorProfileId: null } : {})
    },
    select: {
      id: true,
      secureUrl: true,
      resourceType: true,
      displayName: true,
      originalFilename: true,
      format: true,
      width: true,
      height: true,
      duration: true,
      bytes: true
    },
    orderBy: { createdAt: 'desc' },
    take: 250
  });

  return NextResponse.json({ assets });
}

export async function POST(request: Request) {
  const access = await getAdminApiAccess(request.headers);

  if (!access) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!access.permissions.has('media:manage')) {
    return NextResponse.json(
      { error: 'Media management permission is required.' },
      { status: 403 }
    );
  }

  const body = (await request.json().catch(() => null)) as
    | {
        upload?: CloudinaryUploadResult;
        altText?: string;
        vendorProfileId?: string | null;
      }
    | null;
  const upload = body?.upload;

  if (!upload?.public_id || !upload.secure_url) {
    return NextResponse.json(
      { error: 'Cloudinary upload metadata is incomplete.' },
      { status: 400 }
    );
  }

  const publicId = upload.public_id;
  const secureUrl = upload.secure_url;
  const metadata: Prisma.InputJsonObject = upload;

  try {
    const workspaceRoot = cloudinaryUploadFolder({
      workspaceId: access.membership.workspaceId,
      workspaceFolderPrefix: access.membership.workspace.mediaFolderPrefix,
      purpose: 'general'
    }).replace(/\/general$/, '');

    assertCloudinaryUploadResult(upload, workspaceRoot);
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

  const vendorProfileId = body?.vendorProfileId?.trim() || null;

  if (vendorProfileId) {
    const vendor = await prisma.vendorProfile.findFirst({
      where: {
        id: vendorProfileId,
        workspaceId: access.membership.workspaceId
      },
      select: { id: true }
    });

    if (!vendor) {
      return NextResponse.json(
        { error: 'Vendor ownership is invalid.' },
        { status: 400 }
      );
    }
  }

  const existing = await prisma.mediaAsset.findUnique({
    where: { publicId },
    select: { id: true, workspaceId: true }
  });

  if (existing && existing.workspaceId !== access.membership.workspaceId) {
    return NextResponse.json(
      { error: 'This Cloudinary asset is already registered to another workspace.' },
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
    vendorProfileId
  };

  const asset = await prisma.$transaction(async transaction => {
    const registered = existing
      ? await transaction.mediaAsset.update({
          where: { id: existing.id },
          data: {
            ...data,
            metadata
          }
        })
      : await transaction.mediaAsset.create({
          data: {
            ...data,
            workspaceId: access.membership.workspaceId,
            uploadedById: access.session.user.id,
            publicId,
            metadata
          }
        });

    await transaction.adminAuditEvent.create({
      data: {
        workspaceId: access.membership.workspaceId,
        actorId: access.session.user.id,
        action: existing ? 'MEDIA_UPDATED' : 'MEDIA_UPLOADED',
        targetType: 'MEDIA',
        targetId: registered.id,
        summary: `${registered.displayName ?? registered.publicId} was ${
          existing ? 'updated in' : 'added to'
        } Media Studio.`
      }
    });

    return registered;
  });

  return NextResponse.json({ asset });
}

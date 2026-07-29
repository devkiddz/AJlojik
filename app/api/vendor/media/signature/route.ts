import { NextResponse } from 'next/server';

import { getVendorApiAccess } from '@/features/vendor/auth/vendorAccess';
import { createCloudinaryUploadSignature } from '@/lib/cloudinary';

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
    | { purpose?: string }
    | null;

  try {
    return NextResponse.json(
      createCloudinaryUploadSignature({
        workspaceId: access.workspace.id,
        workspaceFolderPrefix: access.workspace.mediaFolderPrefix,
        ownerPath: `vendors/${access.vendor.slug}`,
        purpose: body?.purpose ?? 'general'
      })
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to prepare upload.'
      },
      { status: 400 }
    );
  }
}

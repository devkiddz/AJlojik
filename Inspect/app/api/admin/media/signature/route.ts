import { NextResponse } from 'next/server';

import { getAdminApiAccess } from '@/features/admin/auth/adminPermissions';
import { createCloudinaryUploadSignature } from '@/lib/cloudinary';

export async function POST(request: Request) {
  const access = await getAdminApiAccess(request.headers);

  if (!access) {
    return NextResponse.json({ error: 'Authentication required.' }, { status: 401 });
  }

  if (!access.permissions.has('media:manage')) {
    return NextResponse.json({ error: 'Media management permission is required.' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as { purpose?: string } | null;

  try {
    const signature = createCloudinaryUploadSignature({
      workspaceId: access.membership.workspaceId,
      workspaceFolderPrefix: access.membership.workspace.mediaFolderPrefix,
      purpose: body?.purpose ?? 'general'
    });

    return NextResponse.json(signature);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to prepare upload.' },
      { status: 400 }
    );
  }
}

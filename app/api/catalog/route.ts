import { NextResponse } from 'next/server';

import {
  getCatalog,
  getCatalogCategories,
  getCatalogCollections,
  resolveCatalogWorkspace
} from '@/features/catalog/services/get-catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const requestedWorkspaceId =
      url.searchParams.get('workspaceId');

    const workspace =
      await resolveCatalogWorkspace(requestedWorkspaceId);

    if (!workspace) {
      return NextResponse.json(
        {
          workspaceId: null,
          products: [],
          categories: await getCatalogCategories(),
          collections: []
        },
        {
          headers: {
            'Cache-Control':
              'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        }
      );
    }

    const [products, categories, collections] =
      await Promise.all([
        getCatalog(workspace),
        getCatalogCategories(),
        getCatalogCollections(workspace)
      ]);

    return NextResponse.json(
      {
        workspaceId: workspace.id,
        products,
        categories,
        collections
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate'
        }
      }
    );
  } catch (error) {
    console.error('Failed to load catalog:', error);

    return NextResponse.json(
      {
        error: 'Unable to load catalog.'
      },
      {
        status: 500
      }
    );
  }
}

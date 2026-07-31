import { NextResponse } from 'next/server';

import { getCatalog, getCatalogCategories } from '@/features/catalog/services/get-catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [products, categories] = await Promise.all([
      getCatalog(),
      getCatalogCategories()
    ]);

    return NextResponse.json(
      {
        products,
        categories
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
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

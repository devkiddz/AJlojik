import { prisma } from '@/lib/prisma';

import type { CatalogCategoryRecord } from '../catalogTypes';
import { mapDatabaseProduct } from '../mappers/map-database-product';

export async function getCatalog() {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      status: 'PUBLISHED'
    },
    include: {
      category: {
        select: {
          slug: true
        }
      },
      subcategory: {
        select: {
          slug: true
        }
      },
      images: {
        orderBy: {
          position: 'asc'
        }
      },
      variants: {
        where: {
          active: true
        },
        include: {
          inventory: true
        },
        orderBy: {
          position: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return products.map(mapDatabaseProduct);
}

export async function getCatalogCategories(): Promise<CatalogCategoryRecord[]> {
  const categories = await prisma.category.findMany({
    where: {
      active: true
    },
    include: {
      subcategories: {
        where: {
          active: true
        },
        orderBy: [{ position: 'asc' }, { label: 'asc' }]
      }
    },
    orderBy: [{ position: 'asc' }, { label: 'asc' }]
  });

  return categories.map(category => ({
    id: category.id,
    slug: category.slug,
    label: category.label,
    iconName: category.iconName,
    image: category.image || '/placeholder.svg',
    coverImages: category.coverImages,
    shortDescription: category.shortDescription || '',
    description: category.description || '',
    ...(category.accentColor ? { accentColor: category.accentColor } : {}),
    subcategories: category.subcategories.map(subcategory => ({
      label: subcategory.label,
      slug: subcategory.slug
    })),
    ...(category.className ? { className: category.className } : {})
  }));
}

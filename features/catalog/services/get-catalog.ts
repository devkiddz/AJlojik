import { prisma } from "@/lib/prisma";

import { mapDatabaseProduct } from "../mappers/map-database-product";

export async function getCatalog() {
  const products = await prisma.product.findMany({
    include: {
      images: {
        orderBy: {
          position: "asc",
        },
      },

      variants: {
        include: {
          inventory: true,
        },

        orderBy: {
          position: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return products.map(mapDatabaseProduct);
}
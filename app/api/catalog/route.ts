import { NextResponse } from "next/server";

import { getCatalog } from "@/features/catalog/services/get-catalog";

export async function GET() {
  try {
    const products = await getCatalog();

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to load catalog:", error);

    return NextResponse.json(
      {
        error: "Unable to load catalog.",
      },
      {
        status: 500,
      }
    );
  }
}
import {
  NextRequest,
  NextResponse
} from 'next/server';

import { PreparationRepository } from '@/features/shopping-list-preparation/preparationRepository';
import { preparationErrorResponse } from '@/features/shopping-list-preparation/preparationRouteResponse';
import { requirePreparationCustomer } from '@/features/shopping-list-preparation/preparationAuthorization';

export const dynamic =
  'force-dynamic';

export const revalidate =
  0;

export async function GET(
  request: NextRequest
) {
  try {
    const workspaceId =
      request.nextUrl.searchParams
        .get('workspaceId')
        ?.trim() ||
      undefined;

    const shoppingListId =
      request.nextUrl.searchParams
        .get('shoppingListId')
        ?.trim() ||
      undefined;

    const access =
      await requirePreparationCustomer(
        request.headers,
        workspaceId
      );

    const requests =
      await PreparationRepository.listCustomerRequests(
        access.userId,
        {
          workspaceId,
          shoppingListId
        }
      );

    return NextResponse.json(
      {
        requests
      },
      {
        headers: {
          'Cache-Control':
            'no-store'
        }
      }
    );
  } catch (error) {
    return preparationErrorResponse(
      error,
      'Unable to load preparation requests.'
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      (await request.json()) as {
        workspaceId?: unknown;
        shoppingListId?: unknown;
        customerNote?: unknown;
      };

    const workspaceId =
      typeof body.workspaceId ===
      'string'
        ? body.workspaceId.trim()
        : '';

    const shoppingListId =
      typeof body.shoppingListId ===
      'string'
        ? body.shoppingListId.trim()
        : '';

    if (
      !workspaceId ||
      !shoppingListId
    ) {
      return NextResponse.json(
        {
          error:
            'workspaceId and shoppingListId are required.'
        },
        {
          status: 400
        }
      );
    }

    const access =
      await requirePreparationCustomer(
        request.headers,
        workspaceId
      );

    const preparation =
      await PreparationRepository.submit(
        access.userId,
        {
          workspaceId,
          shoppingListId,
          customerNote:
            typeof body.customerNote ===
            'string'
              ? body.customerNote
                  .trim()
                  .slice(
                    0,
                    1000
                  )
              : null
        }
      );

    return NextResponse.json(
      {
        preparation
      },
      {
        status: 201
      }
    );
  } catch (error) {
    return preparationErrorResponse(
      error,
      'Unable to submit this Shopping List for preparation.'
    );
  }
}

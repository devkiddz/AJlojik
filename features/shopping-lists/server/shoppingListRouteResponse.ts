import {
  NextResponse
} from 'next/server';

type ShoppingListErrorResponse = {
  error: string;
};

type ErrorWithStatus = {
  message?: unknown;
  status?: unknown;
  statusCode?: unknown;
};

function resolveErrorMessage(
  error: unknown
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message;
  }

  return 'Unable to complete the shopping list request.';
}

function resolveErrorStatus(
  error: unknown
): number {
  if (
    error &&
    typeof error === 'object'
  ) {
    const candidate =
      error as ErrorWithStatus;

    const status =
      typeof candidate.status ===
      'number'
        ? candidate.status
        : candidate.statusCode;

    if (
      typeof status === 'number' &&
      status >= 400 &&
      status <= 599
    ) {
      return status;
    }
  }

  if (error instanceof SyntaxError) {
    return 400;
  }

  const message =
    resolveErrorMessage(
      error
    ).toLowerCase();

  if (
    message.includes(
      'authentication'
    ) ||
    message.includes(
      'authenticated'
    ) ||
    message.includes(
      'sign in'
    ) ||
    message.includes(
      'unauthorized'
    )
  ) {
    return 401;
  }

  if (
    message.includes(
      'permission'
    ) ||
    message.includes(
      'forbidden'
    ) ||
    message.includes(
      'access'
    ) ||
    message.includes(
      'does not belong'
    )
  ) {
    return 403;
  }

  if (
    message.includes(
      'not found'
    ) ||
    message.includes(
      'could not be found'
    )
  ) {
    return 404;
  }

  if (
    message.includes(
      'already exists'
    ) ||
    message.includes(
      'duplicate'
    ) ||
    message.includes(
      'conflict'
    )
  ) {
    return 409;
  }

  if (
    message.includes(
      'required'
    ) ||
    message.includes(
      'invalid'
    ) ||
    message.includes(
      'must be'
    ) ||
    message.includes(
      'cannot be'
    ) ||
    message.includes(
      'workspace'
    )
  ) {
    return 400;
  }

  return 500;
}

export function respondToShoppingListRouteError(
  error: unknown
): NextResponse<ShoppingListErrorResponse> {
  const status =
    resolveErrorStatus(
      error
    );

  const message =
    status === 500
      ? 'Unable to complete the shopping list request.'
      : resolveErrorMessage(
          error
        );

  if (status === 500) {
    console.error(
      '[shopping-lists]',
      error
    );
  }

  return NextResponse.json(
    {
      error: message
    },
    {
      status
    }
  );
}
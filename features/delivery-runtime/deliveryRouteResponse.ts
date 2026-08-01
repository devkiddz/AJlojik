import { NextResponse } from 'next/server';

export class DeliveryRuntimeError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

export function deliveryErrorResponse(
  error: unknown,
  fallback: string
) {
  const status =
    error instanceof DeliveryRuntimeError
      ? error.status
      : error instanceof Error &&
          error.message.startsWith(
            'Delivery cannot move directly'
          )
        ? 409
        : 500;

  if (status === 500) {
    console.error(fallback, error);
  }

  return NextResponse.json(
    {
      error:
        error instanceof Error
          ? error.message
          : fallback
    },
    {
      status
    }
  );
}

import {
  NextResponse
} from 'next/server';

import {
  PreparationAccessError
} from './preparationAuthorization';

import {
  PreparationRuntimeError
} from './preparationRepository';

export function preparationErrorResponse(
  error: unknown,
  fallback: string
) {
  const status =
    error instanceof
      PreparationAccessError ||
    error instanceof
      PreparationRuntimeError
      ? error.status
      : 500;

  if (status === 500) {
    console.error(
      fallback,
      error
    );
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

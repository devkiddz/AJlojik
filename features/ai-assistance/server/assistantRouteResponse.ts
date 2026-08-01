import {
  NextResponse
} from 'next/server';

export class AssistantRuntimeError extends Error {
  constructor(
    message: string,
    readonly status = 400
  ) {
    super(message);
  }
}

export function assistantErrorResponse(
  error: unknown,
  fallback: string
) {
  const status =
    error instanceof
    AssistantRuntimeError
      ? error.status
      : 500;

  if (
    status ===
    500
  ) {
    console.error(
      fallback,
      error
    );
  }

  return NextResponse.json(
    {
      error:
        error instanceof
        Error
          ? error.message
          : fallback
    },
    {
      status
    }
  );
}

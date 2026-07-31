export class CartRouteError extends Error {
  readonly status: number;

  constructor(message: string, status = 400) {
    super(message);

    this.name = 'CartRouteError';
    this.status = status;
  }
}

function readObject(value: unknown): Record<string, unknown> {
  if (
    typeof value !== 'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new CartRouteError(
      'The cart request body is invalid.'
    );
  }

  return value as Record<string, unknown>;
}

function readRequiredString(
  value: unknown,
  fieldName: string
): string {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0
  ) {
    throw new CartRouteError(
      `${fieldName} is required.`
    );
  }

  return value.trim();
}

function readInteger(
  value: unknown,
  fieldName: string
): number {
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value)
  ) {
    throw new CartRouteError(
      `${fieldName} must be an integer.`
    );
  }

  return value;
}

export type AddCartItemPayload = {
  workspaceId: string;
  productId: string;
  variantId: string;
  quantity: number;
};

export type UpdateCartItemPayload = {
  workspaceId: string;
  quantity: number;
};

export type WorkspacePayload = {
  workspaceId: string;
};

export function parseAddCartItemPayload(
  value: unknown
): AddCartItemPayload {
  const body = readObject(value);

  const quantity = readInteger(
    body.quantity,
    'quantity'
  );

  if (quantity < 1) {
    throw new CartRouteError(
      'Cart quantity must be at least one.'
    );
  }

  return {
    workspaceId: readRequiredString(
      body.workspaceId,
      'workspaceId'
    ),

    productId: readRequiredString(
      body.productId,
      'productId'
    ),

    variantId: readRequiredString(
      body.variantId,
      'variantId'
    ),

    quantity
  };
}

export function parseUpdateCartItemPayload(
  value: unknown
): UpdateCartItemPayload {
  const body = readObject(value);

  return {
    workspaceId: readRequiredString(
      body.workspaceId,
      'workspaceId'
    ),

    quantity: readInteger(
      body.quantity,
      'quantity'
    )
  };
}

export function parseWorkspacePayload(
  value: unknown
): WorkspacePayload {
  const body = readObject(value);

  return {
    workspaceId: readRequiredString(
      body.workspaceId,
      'workspaceId'
    )
  };
}
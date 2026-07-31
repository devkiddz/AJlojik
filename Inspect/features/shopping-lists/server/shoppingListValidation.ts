export class ShoppingListRouteError
  extends Error {
  readonly status: number;

  constructor(
    message: string,
    status = 400
  ) {
    super(message);

    this.name =
      'ShoppingListRouteError';

    this.status = status;
  }
}

function readObject(
  value: unknown
): Record<string, unknown> {
  if (
    typeof value !==
      'object' ||
    value === null ||
    Array.isArray(value)
  ) {
    throw new ShoppingListRouteError(
      'The shopping list request body is invalid.'
    );
  }

  return value as Record<
    string,
    unknown
  >;
}

function readRequiredString(
  value: unknown,
  fieldName: string
): string {
  if (
    typeof value !==
      'string' ||
    value.trim().length === 0
  ) {
    throw new ShoppingListRouteError(
      `${fieldName} is required.`
    );
  }

  return value.trim();
}

function readOptionalString(
  value: unknown,
  fieldName: string
): string | undefined {
  if (
    value === undefined ||
    value === null
  ) {
    return undefined;
  }

  if (
    typeof value !==
    'string'
  ) {
    throw new ShoppingListRouteError(
      `${fieldName} must be text.`
    );
  }

  return value.trim();
}

function readOptionalInteger(
  value: unknown,
  fieldName: string
): number | undefined {
  if (
    value === undefined ||
    value === null
  ) {
    return undefined;
  }

  if (
    typeof value !==
      'number' ||
    !Number.isInteger(value)
  ) {
    throw new ShoppingListRouteError(
      `${fieldName} must be an integer.`
    );
  }

  return value;
}

export type WorkspacePayload = {
  workspaceId: string;
};

export type CreateShoppingListPayload = {
  workspaceId: string;
  name: string;
  description?: string;
};

export type UpdateShoppingListPayload = {
  workspaceId: string;

  name?: string;

  description?:
    string | null;

  status?:
    'ACTIVE' | 'ARCHIVED';
};

export type ShoppingListPublicationPayload = {
  workspaceId: string;
  action: 'SUBMIT' | 'WITHDRAW';
};

export type AddShoppingListItemPayload = {
  workspaceId: string;

  productId: string;
  variantId: string | null;

  quantity: number;
  note?: string;
};

export type UpdateShoppingListItemPayload = {
  workspaceId: string;

  quantity?: number;
  note?: string | null;
  position?: number;
};

export function parseWorkspacePayload(
  value: unknown
): WorkspacePayload {
  const body =
    readObject(value);

  return {
    workspaceId:
      readRequiredString(
        body.workspaceId,
        'workspaceId'
      )
  };
}

export function parseCreateShoppingListPayload(
  value: unknown
): CreateShoppingListPayload {
  const body =
    readObject(value);

  const name =
    readRequiredString(
      body.name,
      'name'
    );

  if (name.length > 80) {
    throw new ShoppingListRouteError(
      'Shopping list names cannot exceed 80 characters.'
    );
  }

  return {
    workspaceId:
      readRequiredString(
        body.workspaceId,
        'workspaceId'
      ),

    name,

    description:
      readOptionalString(
        body.description,
        'description'
      )
  };
}

export function parseUpdateShoppingListPayload(
  value: unknown
): UpdateShoppingListPayload {
  const body =
    readObject(value);

  const name =
    readOptionalString(
      body.name,
      'name'
    );

  if (
    name !== undefined &&
    name.length === 0
  ) {
    throw new ShoppingListRouteError(
      'Shopping list name cannot be empty.'
    );
  }

  const status =
    body.status;

  if (
    status !== undefined &&
    status !== 'ACTIVE' &&
    status !== 'ARCHIVED'
  ) {
    throw new ShoppingListRouteError(
      'status is invalid.'
    );
  }

  return {
    workspaceId:
      readRequiredString(
        body.workspaceId,
        'workspaceId'
      ),

    name,

    description:
      body.description === null
        ? null
        : readOptionalString(
            body.description,
            'description'
          ),

    status
  };
}

export function parseShoppingListPublicationPayload(
  value: unknown
): ShoppingListPublicationPayload {
  const body = readObject(value);
  const action = body.action;

  if (action !== 'SUBMIT' && action !== 'WITHDRAW') {
    throw new ShoppingListRouteError('A valid publication action is required.');
  }

  return {
    workspaceId: readRequiredString(body.workspaceId, 'workspaceId'),
    action
  };
}

export function parseAddShoppingListItemPayload(
  value: unknown
): AddShoppingListItemPayload {
  const body =
    readObject(value);

  const quantity =
    readOptionalInteger(
      body.quantity,
      'quantity'
    ) ?? 1;

  if (quantity < 1) {
    throw new ShoppingListRouteError(
      'Shopping list quantity must be at least one.'
    );
  }

  return {
    workspaceId:
      readRequiredString(
        body.workspaceId,
        'workspaceId'
      ),

    productId:
      readRequiredString(
        body.productId,
        'productId'
      ),

    variantId:
      body.variantId === null ||
      body.variantId === undefined
        ? null
        : readRequiredString(
            body.variantId,
            'variantId'
          ),

    quantity,

    note:
      readOptionalString(
        body.note,
        'note'
      )
  };
}

export function parseUpdateShoppingListItemPayload(
  value: unknown
): UpdateShoppingListItemPayload {
  const body =
    readObject(value);

  const quantity =
    readOptionalInteger(
      body.quantity,
      'quantity'
    );

  const position =
    readOptionalInteger(
      body.position,
      'position'
    );

  if (
    quantity !== undefined &&
    quantity < 1
  ) {
    throw new ShoppingListRouteError(
      'Shopping list quantity must be at least one.'
    );
  }

  if (
    position !== undefined &&
    position < 0
  ) {
    throw new ShoppingListRouteError(
      'Shopping list position cannot be negative.'
    );
  }

  return {
    workspaceId:
      readRequiredString(
        body.workspaceId,
        'workspaceId'
      ),

    quantity,

    position,

    note:
      body.note === null
        ? null
        : readOptionalString(
            body.note,
            'note'
          )
  };
}
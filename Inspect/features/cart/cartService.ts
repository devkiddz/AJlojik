import type {
  CartItem,
  CartMutationResponse
} from './cartTypes';

type AddCartItemPayload = {
  workspaceId: string;
  productId: string;
  variantId: string;
  quantity: number;
};

type UpdateCartItemPayload = {
  workspaceId: string;
  quantity: number;
};

type WorkspacePayload = {
  workspaceId: string;
};

async function readCartResponse<T>(
  response: Response
): Promise<T> {
  const contentType =
    response.headers.get('content-type') ?? '';

  const rawBody = await response.text();

  if (
    !contentType.includes('application/json')
  ) {
    throw new Error(
      `The cart API returned an unexpected response (${response.status}).`
    );
  }

  let body: T & {
    error?: string;
  };

  try {
    body = JSON.parse(rawBody) as T & {
      error?: string;
    };
  } catch {
    throw new Error(
      'The cart API returned invalid JSON.'
    );
  }

  if (!response.ok) {
    throw new Error(
      body.error ??
        `The cart request failed (${response.status}).`
    );
  }

  return body;
}

export async function getCart(
  workspaceId: string
): Promise<CartItem[]> {
  const searchParams = new URLSearchParams({
    workspaceId
  });

  const response = await fetch(
    `/api/cart?${searchParams.toString()}`,
    {
      method: 'GET',
      cache: 'no-store'
    }
  );

  const result = await readCartResponse<{
    items: CartItem[];
  }>(response);

  return result.items;
}

export async function addCartItem(
  payload: AddCartItemPayload
): Promise<CartMutationResponse> {
  const response = await fetch('/api/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return readCartResponse<CartMutationResponse>(
    response
  );
}

export async function updateCartItem(
  itemId: string,
  payload: UpdateCartItemPayload
): Promise<CartMutationResponse> {
  const response = await fetch(
    `/api/cart/${itemId}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  return readCartResponse<CartMutationResponse>(
    response
  );
}

export async function removeCartItem(
  itemId: string,
  payload: WorkspacePayload
): Promise<CartMutationResponse> {
  const response = await fetch(
    `/api/cart/${itemId}`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    }
  );

  return readCartResponse<CartMutationResponse>(
    response
  );
}

export async function clearCart(
  payload: WorkspacePayload
): Promise<CartMutationResponse> {
  const response = await fetch('/api/cart', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return readCartResponse<CartMutationResponse>(
    response
  );
}
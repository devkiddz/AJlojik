type RecordProductViewInput = {
  productId: string;
};

type RecordProductViewResponse = {
  recorded: boolean;
  productId?: string;
  viewedAt?: string;
  reason?: string;
  error?: string;
};

export async function recordProductView({
  productId
}: RecordProductViewInput): Promise<boolean> {
  const normalizedProductId =
    productId.trim();

  if (!normalizedProductId) {
    return false;
  }

  try {
    const response = await fetch(
      '/api/product-activity/view',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          productId:
            normalizedProductId
        })
      }
    );

    const result =
      (await response
        .json()
        .catch(() => null)) as
        | RecordProductViewResponse
        | null;

    if (!response.ok) {
      /*
       * Guests are allowed to preview products.
       * Their unauthenticated view should not
       * interrupt the Store experience.
       */
      if (
        response.status !== 401
      ) {
        console.warn(
          'Product view was not recorded:',
          result?.error ??
            response.statusText
        );
      }

      return false;
    }

    return result?.recorded === true;
  } catch (error) {
    console.warn(
      'Product-view tracking request failed:',
      error
    );

    return false;
  }
}
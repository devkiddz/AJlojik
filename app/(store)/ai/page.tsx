import {
  AssistantRuntimePage
} from '@/features/ai-assistance';

type AiPageProps = {
  searchParams:
    Promise<
      Record<
        string,
        | string
        | string[]
        | undefined
      >
    >;
};

function readValue(
  value:
    | string
    | string[]
    | undefined
): string | null {
  if (
    Array.isArray(
      value
    )
  ) {
    return value[0]?.trim() ||
      null;
  }

  return value?.trim() ||
    null;
}

export default async function AiPage({
  searchParams
}: AiPageProps) {
  const params =
    await searchParams;

  const mode =
    readValue(
      params.mode
    );

  const intent =
    readValue(
      params.intent
    );

  const productId =
    readValue(
      params.productId
    );

  const category =
    readValue(
      params.category
    );

  const productName =
    readValue(
      params.productName
    );

  const contextParts =
    [
      mode
        ? `Mode: ${mode}`
        : null,
      intent
        ? `Intent: ${intent}`
        : null,
      productName
        ? `Product: ${productName}`
        : productId
          ? `Product: ${productId}`
          : null,
      category
        ? `Category: ${category}`
        : null
    ].filter(
      (
        value
      ): value is string =>
        Boolean(
          value
        )
    );

  return (
    <AssistantRuntimePage
      audience="customer"
      contextLabel={
        contextParts.length
          ? contextParts.join(
              ' · '
            )
          : 'Customer discovery, Wishlist and Shopping List context'
      }
      initialContext={{
        mode,
        intent,
        productId,
        category
      }}
      initialPrompt={
        mode ===
          'deep-insight' &&
        productName
          ? `Give me a deep insight into ${productName}. Explain its strongest use cases, who it suits, important trade-offs, value for the price, and what I should compare before deciding.`
          : ''
      }
    />
  );
}

import {
  AssistantFoundationPage
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

  const contextParts =
    [
      mode
        ? `Mode: ${mode}`
        : null,

      intent
        ? `Intent: ${intent}`
        : null,

      productId
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
    <AssistantFoundationPage
      audience="customer"
      contextLabel={
        contextParts.length >
        0
          ? contextParts.join(
              ' · '
            )
          : 'Customer discovery, Wishlist and Shopping List context'
      }
    />
  );
}

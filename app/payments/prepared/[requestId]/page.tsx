import {
  PreparedCheckoutExperience
} from '@/features/shopping-list-preparation/PreparedCheckoutExperience';

export default async function PreparedCheckoutPage({
  params
}: {
  params: Promise<{
    requestId: string;
  }>;
}) {
  const {
    requestId
  } =
    await params;

  return (
    <PreparedCheckoutExperience
      requestId={
        requestId
      }
    />
  );
}

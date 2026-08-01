import {
  CustomerOrderDetailExperience
} from '@/features/delivery-runtime/CustomerOrderDetailExperience';

export default async function CustomerOrderDetailPage({
  params
}: {
  params: Promise<{
    orderId:
      string;
  }>;
}) {
  const {
    orderId
  } =
    await params;

  return (
    <CustomerOrderDetailExperience
      orderId={
        orderId
      }
    />
  );
}

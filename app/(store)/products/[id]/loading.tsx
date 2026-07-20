// app/products/[id]/loading.tsx
import StoreLoadingState from '@/components/loading/StoreLoadingState';

export default function ProductPageLoading() {
  return <StoreLoadingState label="Loading product details" />;
}

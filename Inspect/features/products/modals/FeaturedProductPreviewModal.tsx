import { ProductPreviewModal, type ProductPreviewModalProps } from './ProductPreviewModal';

export function FeaturedProductPreviewModal(props: ProductPreviewModalProps) {
  return (
    <>
      <ProductPreviewModal {...props} mode="featured" badge="Featured experience" />
    </>
  );
}

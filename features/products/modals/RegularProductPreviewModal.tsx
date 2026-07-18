import { ProductPreviewModal, type ProductPreviewModalProps } from './ProductPreviewModal';

export function RegularProductPreviewModal(props: ProductPreviewModalProps) {
  return <ProductPreviewModal {...props} mode="regular" />;
}

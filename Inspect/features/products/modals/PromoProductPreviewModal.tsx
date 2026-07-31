import { ProductPreviewModal, type ProductPreviewModalProps } from './ProductPreviewModal';

type PromoProductPreviewModalProps = ProductPreviewModalProps & {
  promoBadge?: string;
  promoAccent?: string;
};

export function PromoProductPreviewModal({
  promoBadge,
  promoAccent,
  ...props
}: PromoProductPreviewModalProps) {
  return <ProductPreviewModal {...props} mode="promo" badge={promoBadge} accent={promoAccent} />;
}

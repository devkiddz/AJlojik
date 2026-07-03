import { BannerType } from '@/data/collections';

type Props = {
  banners: BannerType[];
};

export default function CollectionBanner({ banners }: Props) {
  return <div>{banners.length} banner(s)</div>;
}

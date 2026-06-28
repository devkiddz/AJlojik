'use client';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchBackdrop({ open, onClose }: Props) {
  if (!open) return null;

  return <div aria-hidden onClick={onClose} className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" />;
}

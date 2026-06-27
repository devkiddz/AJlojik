'use client';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchOverlay({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <button
      type="button"
      aria-label="Close search"
      onClick={onClose}
      className="
        fixed
        inset-0
        z-40

        bg-black/20

        backdrop-blur-[2px]

        animate-in
        fade-in
        duration-200
      "
    />
  );
}

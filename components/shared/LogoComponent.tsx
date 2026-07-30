'use client';

import {
  motion,
  useReducedMotion
} from 'framer-motion';

import Image from 'next/image';
import Link from 'next/link';

export default function LogoComponent({
  brandName,
  brandSlug
}: {
  brandName: string;
  brandSlug: string;
}) {
  const reducedMotion = useReducedMotion();
  const accessibleName = `${brandName} ${brandSlug}`.trim();

  return (
    <motion.div
      whileHover={reducedMotion ? undefined : { y: -1, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
      <Link
        href="/"
        aria-label={`${accessibleName} home`}
        title={accessibleName}
        className="group relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-background/65 shadow-[inset_0_1px_0_rgba(255,255,255,0.09),0_10px_30px_rgba(0,0,0,0.18)] outline-none transition hover:border-accent/30 focus-visible:ring-2 focus-visible:ring-ring/60 lg:size-11">
        <motion.span
          aria-hidden="true"
          animate={
            reducedMotion
              ? undefined
              : {
                  opacity: [0.72, 1, 0.72],
                  scale: [1, 1.04, 1]
                }
          }
          transition={{ duration: 3.2, ease: 'easeInOut', repeat: Number.POSITIVE_INFINITY }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(215,184,111,0.2),transparent_48%)]"
        />

        <Image
          src="/pwa/icon-192.png"
          alt=""
          width={44}
          height={44}
          priority
          className="relative size-full object-cover transition duration-300 group-hover:scale-[1.04]"
        />
      </Link>
    </motion.div>
  );
}

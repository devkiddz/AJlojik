'use client';

import {
  motion,
  useReducedMotion
} from 'framer-motion';

import Link from 'next/link';

export default function LogoComponent({
  brandName,
  brandSlug
}: {
  brandName: string;
  brandSlug: string;
}) {
  const reducedMotion =
    useReducedMotion();

  const accessibleName =
    `${brandName} ${brandSlug}`.trim();

  return (
    <motion.div
      whileHover={
        reducedMotion
          ? undefined
          : {
              y: -1
            }
      }
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24
      }}>
      <Link
        href="/"
        aria-label={`${accessibleName} home`}
        title={accessibleName}
        className="group relative flex min-w-0 shrink-0 items-center rounded-xl px-1 py-2 leading-none outline-none transition focus-visible:ring-2 focus-visible:ring-ring/60">
        <span className="pointer-events-none absolute inset-x-1 -bottom-0.5 h-px origin-left scale-x-0 bg-gradient-to-r from-secondary via-accent to-transparent transition-transform duration-300 group-hover:scale-x-100" />

        <span className="flex min-w-0 items-baseline gap-1 whitespace-nowrap">
          <strong className="text-sm font-black tracking-[-0.035em] text-secondary sm:text-[15px] lg:text-base">
            {brandName}
          </strong>

          <span className="text-sm font-semibold tracking-[-0.035em] text-foreground sm:text-[15px] lg:text-base">
            {brandSlug}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

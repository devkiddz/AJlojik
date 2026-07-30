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
      whileHover={reducedMotion ? undefined : { y: -1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 24
      }}>
      <Link
        href="/"
        aria-label={`${accessibleName} home`}
        title={accessibleName}
        className="group flex min-w-0 shrink-0 items-center gap-1.5 rounded-2xl px-0.5 py-1 outline-none transition focus-visible:ring-2 focus-visible:ring-ring/60">
        <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl border border-white/10 bg-background/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.11),0_10px_26px_rgba(0,0,0,0.16)] transition group-hover:border-accent/30 lg:size-10">
          <motion.span
            aria-hidden="true"
            animate={
              reducedMotion
                ? undefined
                : {
                    opacity: [0.7, 1, 0.7],
                    scale: [1, 1.04, 1]
                  }
            }
            transition={{
              duration: 3.2,
              ease: 'easeInOut',
              repeat: Number.POSITIVE_INFINITY
            }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_35%_20%,rgba(215,184,111,0.22),transparent_50%)]"
          />

          <Image
            src="/pwa/icon-192.png"
            alt=""
            width={40}
            height={40}
            priority
            className="relative size-full object-cover transition duration-300 group-hover:scale-[1.04]"
          />
        </span>

        <span className="flex min-w-0 items-baseline gap-1 whitespace-nowrap leading-none">
          <strong className="text-[13px] font-black tracking-tight text-secondary sm:text-sm lg:text-base">
            {brandName}
          </strong>

          <span className="text-[13px] font-semibold tracking-tight text-foreground sm:text-sm lg:text-base">
            {brandSlug}
          </span>
        </span>
      </Link>
    </motion.div>
  );
}

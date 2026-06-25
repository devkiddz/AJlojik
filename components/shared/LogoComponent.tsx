'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Aperture } from 'lucide-react';

export default function LogoComponent({ brandName, brandSlug }: { brandName: string; brandSlug: string }) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link className="flex items-baseline gap-1" href="/">
        <h1 className="text-secondary text-lg font-bold">{brandName}</h1>{' '}
        <span className=" text-lg font-normal">{brandSlug}</span>
        <Aperture className="text-secondary w-2 h-2" />
      </Link>
    </motion.div>
  );
}

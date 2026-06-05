'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Aperture } from 'lucide-react';

export default function LogoComponent() {
  return (
    <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
      <Link className="flex items-baseline gap-1" href="/">
        <h1 className="text-rose-500 text-md md:text-lg font-bold">AJ</h1>{' '}
        <span className="font-light tracking-tight">Lojik</span>
        <Aperture className="text-rose-500 w-2 h-2" />
      </Link>
    </motion.div>
  );
}

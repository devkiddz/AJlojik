'use client';

import { useCallback, type ComponentPropsWithoutRef, type CSSProperties, type PointerEvent } from 'react';

import { cn } from '@/lib/utils';

import styles from './premiumCard.module.css';

type PremiumCardStyle = CSSProperties & {
  '--premium-card-pointer-x'?: string;
  '--premium-card-pointer-y'?: string;
  '--premium-card-glow-size'?: string;
};

type PremiumCardSurfaceProps = ComponentPropsWithoutRef<'article'> & {
  glowSize?: number;
};

export function PremiumCardSurface({
  children,
  className,
  glowSize = 352,
  onPointerMove,
  onPointerLeave,
  style,
  ...props
}: PremiumCardSurfaceProps) {
  const handlePointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      onPointerMove?.(event);

      if (event.pointerType !== 'mouse' && event.pointerType !== 'pen') {
        return;
      }

      const bounds = event.currentTarget.getBoundingClientRect();

      const pointerX = event.clientX - bounds.left;

      const pointerY = event.clientY - bounds.top;

      event.currentTarget.style.setProperty('--premium-card-pointer-x', `${pointerX}px`);

      event.currentTarget.style.setProperty('--premium-card-pointer-y', `${pointerY}px`);
    },
    [onPointerMove]
  );

  const handlePointerLeave = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      onPointerLeave?.(event);

      event.currentTarget.style.setProperty('--premium-card-pointer-x', '50%');

      event.currentTarget.style.setProperty('--premium-card-pointer-y', '50%');
    },
    [onPointerLeave]
  );

  return (
    <article
      {...props}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={
        {
          ...style,

          '--premium-card-pointer-x': '50%',
          '--premium-card-pointer-y': '50%',
          '--premium-card-glow-size': `${glowSize}px`
        } as PremiumCardStyle
      }
      className={cn(styles.surface, 'min-h-0 min-w-0', className)}>
      <div aria-hidden="true" className={styles.glow} />

      <div className="relative z-10 min-h-0 min-w-0">{children}</div>
    </article>
  );
}

'use client';
import Image from 'next/image';
import type { StoreStudioReelProjection } from '../contracts';
export function StoreReelsRail({ reels }: { reels: StoreStudioReelProjection[] }) {
  if (!reels.length) return null;
  return <section className="min-w-0"><h2 className="mb-3 text-sm font-bold sm:text-base">Reels</h2><div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">{reels.map(reel => <article key={reel.id} className="relative aspect-[9/14] w-36 shrink-0 overflow-hidden rounded-2xl bg-muted sm:w-44"><Image src={reel.posterUrl} alt={reel.title} fill sizes="176px" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" /><div className="absolute inset-x-0 bottom-0 p-3 text-white"><p className="line-clamp-2 text-xs font-bold">{reel.title}</p>{reel.vendorName ? <p className="mt-1 text-[10px] text-white/65">{reel.vendorName}</p> : null}</div></article>)}</div></section>;
}

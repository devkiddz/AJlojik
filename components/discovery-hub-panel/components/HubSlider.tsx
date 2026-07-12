"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useFeedExperience } from "@/features/feed-experience";
import type { HubSlideItem } from "../discoveryHubTypes";

type HubSliderProps = {
  items: HubSlideItem[];
  autoSlide?: boolean;
  variant?: "hero" | "strip" | "grid" | "minimal-grid";
};

const formatPrice = (price?: number) => {
  if (!price) return null;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(price);
};

export default function HubSlider({ items, autoSlide = false, variant = "strip" }: HubSliderProps) {
  const { actions } = useFeedExperience();
  const [activeIndex, setActiveIndex] = useState(0);
  const safeItems = useMemo(() => items.filter(Boolean), [items]);
  const activeItem = safeItems[activeIndex];

  const openItem = (item: HubSlideItem) => {
    if (item.target) return actions.openExperience(item.target);
    if (item.id.startsWith("prod_")) {
      actions.openExperience({ type: "product", productId: item.id });
    }
  };

  useEffect(() => {
    if (!autoSlide || safeItems.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % safeItems.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [autoSlide, safeItems.length]);

  if (!safeItems.length) return null;

  if (variant === "hero" && activeItem) {
    return (
      <div className="mt-4">
        <button type="button" onClick={() => openItem(activeItem)} className="relative block w-full overflow-hidden rounded-xl border border-primary/10 bg-background text-left shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="relative h-60">
            <Image src={activeItem.image} alt={activeItem.title} fill className="object-cover transition duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              {activeItem.badge && <span className="mb-2 inline-flex rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary">{activeItem.badge}</span>}
              <h4 className="text-sm font-bold text-white">{activeItem.title}</h4>
              {activeItem.subtitle && <p className="mt-1 line-clamp-2 text-xs text-white/65">{activeItem.subtitle}</p>}
            </div>
          </div>
        </button>
        {safeItems.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5">
            {safeItems.map((item, index) => (
              <button key={item.id} type="button" title={`Show ${item.title}`} onClick={() => setActiveIndex(index)} className={index === activeIndex ? "h-1.5 w-5 rounded-full bg-primary" : "h-1.5 w-1.5 rounded-full bg-primary/25"} />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (variant === "grid" || variant === "minimal-grid") {
    return (
      <div className="mt-4 grid grid-cols-3 gap-3">
        {safeItems.slice(0, 4).map((item) => (
          <button type="button" key={item.id} onClick={() => openItem(item)} className="overflow-hidden rounded-2xl border border-primary/10 bg-background/45 text-left shadow-[0_12px_35px_rgba(0,0,0,0.22)]">
            <div className="relative h-45">
              <Image src={item.image} alt={item.title} fill className="object-cover" />
              {item.badge && <span className="absolute left-2 top-2 rounded-full bg-black/50 px-2 py-0.5 text-[9px] font-semibold text-white">{item.badge}</span>}
            </div>
            <div className="p-2.5">
              <p className="line-clamp-1 text-[11px] font-semibold text-primary">{item.title}</p>
              {variant === "grid" && item.subtitle && <p className="mt-0.5 line-clamp-1 text-[10px] text-primary/50">{item.subtitle}</p>}
              {variant === "grid" && formatPrice(item.price) && <p className="mt-1 text-[12px] font-bold text-primary/80">{formatPrice(item.price)}</p>}
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-4 flex gap-3 overflow-x-auto pb-1 scrollbar-none">
      {safeItems.map((item) => (
        <button type="button" key={item.id} onClick={() => openItem(item)} className="w-24 shrink-0 text-left">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-primary/10 bg-background shadow-[0_10px_30px_rgba(0,0,0,0.2)]">
            <Image src={item.image} alt={item.title} fill className="object-cover" />
          </div>
          <p className="mt-1 line-clamp-1 text-[11px] font-medium text-primary/75">{item.title}</p>
          {formatPrice(item.price) && <p className="text-[12px] font-semibold text-primary/45">{formatPrice(item.price)}</p>}
        </button>
      ))}
    </div>
  );
}

export const EXPERIENCE_PRODUCT_RAIL_CLASS = `
  flex w-full min-w-0
  snap-x snap-mandatory
  items-stretch gap-2
  overflow-x-auto overflow-y-hidden
  overscroll-x-contain
  scroll-smooth
  px-1 pb-3
  scrollbar-none
  sm:gap-3
`;

/**
 * One Store product-card contract.
 *
 * Mobile uses a rail-relative width so every supported phone
 * exposes two complete cards and approximately half of the next.
 * From the small breakpoint upward, cards keep stable physical
 * widths and wider workspaces simply reveal more products.
 */
export const EXPERIENCE_PRODUCT_ITEM_CLASS = `
  w-[calc(40%_-_0.4rem)]
  min-w-[calc(40%_-_0.4rem)]
  max-w-[calc(40%_-_0.4rem)]
  flex-none snap-start

  sm:w-48
  sm:min-w-48
  sm:max-w-48

  md:w-52
  md:min-w-52
  md:max-w-52

  xl:w-56
  xl:min-w-56
  xl:max-w-56
`;

const FALLBACK_PRODUCT_ITEM_WIDTH = 208;
const FALLBACK_PRODUCT_RAIL_GAP = 8;

export function getProductRailScrollStep(
  viewport: HTMLElement,
  itemSelector = '[data-experience-product-item]'
): number {
  const firstItem = viewport.querySelector<HTMLElement>(itemSelector);

  const itemWidth =
    firstItem?.getBoundingClientRect().width ??
    FALLBACK_PRODUCT_ITEM_WIDTH;

  const computedStyle = window.getComputedStyle(viewport);

  const parsedGap = Number.parseFloat(
    computedStyle.columnGap || computedStyle.gap
  );

  const gap = Number.isFinite(parsedGap)
    ? parsedGap
    : FALLBACK_PRODUCT_RAIL_GAP;

  return itemWidth + gap;
}

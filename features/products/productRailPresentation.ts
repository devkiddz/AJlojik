export const EXPERIENCE_PRODUCT_RAIL_CLASS = `
  flex w-full min-w-0
  snap-x snap-mandatory
  items-stretch gap-2
  overflow-x-auto overflow-y-hidden
  overscroll-x-contain
  scroll-smooth
  px-1 pb-3
  scrollbar-none
`;

export const EXPERIENCE_PRODUCT_ITEM_CLASS = `
  w-40 shrink-0 snap-start
  sm:w-48
  md:w-52
`;

const FALLBACK_PRODUCT_ITEM_WIDTH = 208;
const FALLBACK_PRODUCT_RAIL_GAP = 12;

export function getProductRailScrollStep(
  viewport: HTMLElement,
  itemSelector = '[data-experience-product-item]'
): number {
  const firstItem =
    viewport.querySelector<HTMLElement>(
      itemSelector
    );

  const itemWidth =
    firstItem?.getBoundingClientRect().width ??
    FALLBACK_PRODUCT_ITEM_WIDTH;

  const computedStyle =
    window.getComputedStyle(viewport);

  const parsedGap = Number.parseFloat(
    computedStyle.columnGap ||
      computedStyle.gap
  );

  const gap = Number.isFinite(parsedGap)
    ? parsedGap
    : FALLBACK_PRODUCT_RAIL_GAP;

  return itemWidth + gap;
}
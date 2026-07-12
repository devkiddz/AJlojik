import type { Promo } from "@/data/promos";

export function selectActivePromotions(promotions: Promo[], now: Date): Promo[] {
  return promotions
    .filter((promotion) => {
      if (!promotion.active) return false;
      const startsAt = promotion.startsAt ? new Date(promotion.startsAt) : undefined;
      const endsAt = promotion.endsAt ? new Date(promotion.endsAt) : undefined;
      if (startsAt && now < startsAt) return false;
      if (endsAt && now > endsAt) return false;
      return true;
    })
    .sort((a, b) => a.priority - b.priority);
}

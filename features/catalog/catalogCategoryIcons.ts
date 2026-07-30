import {
  BadgePercent,
  CakeSlice,
  Grid2X2Plus,
  LayoutGrid,
  Logs,
  PartyPopper,
  Sparkles,
  UtensilsCrossed,
  Wine,
  type LucideIcon
} from 'lucide-react';

const catalogIcons: Record<string, LucideIcon> = {
  BadgePercent,
  CakeSlice,
  Grid2X2Plus,
  LayoutGrid,
  Logs,
  PartyPopper,
  Sparkles,
  UtensilsCrossed,
  Wine
};

export function resolveCatalogCategoryIcon(iconName: string | null | undefined): LucideIcon {
  return (iconName && catalogIcons[iconName]) || LayoutGrid;
}

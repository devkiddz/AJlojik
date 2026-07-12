import type { ExperienceTarget } from "@/features/feed-experience";

export type HubWidgetLayout = "hero" | "slider" | "grid" | "minimal-grid" | "tracking" | "summary" | "membership";
export type HubGroupId = "home" | "shopping" | "orders" | "rewards" | "ai" | "settings";
export type HubWidgetId = string;
export type HubWidgetSize = "sm" | "md" | "lg";
export type HubWidgetStatus = "idle" | "active" | "warning" | "success";
export type HubPreviewMode = "inline" | "modal" | "feed";
export type HubAction = { label: string; href?: string; target?: ExperienceTarget };
export type HubStat = { label: string; value: string | number; helper?: string };
export type HubSlideItem = { id: string; title: string; subtitle?: string; image: string; price?: number; badge?: string; href?: string; target?: ExperienceTarget };
export type HubVisual = { image: string; alt?: string };
export type HubProgress = { label: string; value: number; helper?: string };
export type HubTimelineItem = { id: string; label: string; description?: string; completed?: boolean; active?: boolean; time?: string };
export type HubCondition = { label: string; value: string };
export type HubLocation = { title: string; subtitle?: string; mapImage?: string; coordinates?: { lat: number; lng: number } };
export type HubWidget = { id: HubWidgetId; groupId: HubGroupId; title: string; description?: string; order: number; enabled: boolean; size?: HubWidgetSize; status?: HubWidgetStatus; badge?: string | number; meta?: string; image?: string; visual?: HubVisual; accent?: string; stats?: HubStat[]; slides?: HubSlideItem[]; autoSlide?: boolean; progress?: HubProgress; timeline?: HubTimelineItem[]; conditions?: HubCondition[]; location?: HubLocation; insight?: string; action?: HubAction; actions?: HubAction[]; layout?: HubWidgetLayout };
export type HubGroupIcon =
  | 'home'
  | 'shopping'
  | 'orders'
  | 'rewards'
  | 'ai'
  | 'settings';

export type HubGroup = {
  id: HubGroupId;
  label: string;
  icon: HubGroupIcon;
  description?: string;
  order: number;
  indicator?: 'dot' | 'new' | 'live' | 'spark';
};
export type HubPreview = { widgetId: HubWidgetId; title: string; description?: string; mode: HubPreviewMode; image?: string; action?: HubAction };
export type HubContextValue = { groups: HubGroup[]; widgets: HubWidget[]; activeGroupId: HubGroupId; activePreview: HubPreview | null; setActiveGroupId: (groupId: HubGroupId) => void; openPreview: (preview: HubPreview) => void; closePreview: () => void };

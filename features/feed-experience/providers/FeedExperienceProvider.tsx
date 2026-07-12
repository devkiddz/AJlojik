"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type {
  ExperienceTarget,
  FeedActions,
  FeedContext,
  FeedExperience,
  FeedIntent,
} from "../contracts";
import { feedExperienceEngine } from "../engine";

type FeedExperienceContextValue = {
  intent: FeedIntent;
  context: FeedContext;
  experience: FeedExperience;
  actions: FeedActions;
};

const FeedExperienceContext =
  createContext<FeedExperienceContextValue | null>(null);

type Props = {
  children: ReactNode;
  initialIntent: FeedIntent;
  context: FeedContext;
  baseActions: Omit<FeedActions, "openExperience" | "resetExperience">;
};

function createIntent(target: ExperienceTarget): FeedIntent {
  const createdAt = new Date().toISOString();
  const nonce = Date.now();

  switch (target.type) {
    case "home":
      return { id: `home:${nonce}`, type: "home", source: "user-action", createdAt };
    case "store-discovery":
      return {
        id: `store-discovery:${target.categorySlug ?? "all"}:${nonce}`,
        type: "store-discovery",
        source: "user-action",
        categorySlug: target.categorySlug ?? "all",
        createdAt,
      };
    case "category":
      return {
        id: `category:${target.categorySlug}:${nonce}`,
        type: "category",
        source: "user-action",
        categorySlug: target.categorySlug,
        createdAt,
      };
    case "product":
      return {
        id: `product:${target.productId}:${nonce}`,
        type: "product",
        source: "hub-card",
        targetId: target.productId,
        createdAt,
      };
    case "collection":
      return {
        id: `collection:${target.collectionId}:${nonce}`,
        type: "collection",
        source: "user-action",
        targetId: target.collectionId,
        createdAt,
      };
    case "promotion":
      return {
        id: `promotion:${target.promotionId}:${nonce}`,
        type: "promotion",
        source: "user-action",
        targetId: target.promotionId,
        createdAt,
      };
    case "search":
      return {
        id: `search:${target.query}:${nonce}`,
        type: "search",
        source: "search",
        query: target.query,
        createdAt,
      };
  }
}

export function FeedExperienceProvider({
  children,
  initialIntent,
  context,
  baseActions,
}: Props) {
  const [intent, setIntent] = useState(initialIntent);

  useEffect(() => {
    if (
      intent.type === "store-discovery" ||
      intent.type === "home" ||
      intent.type === "category"
    ) {
      setIntent(initialIntent);
    }
  }, [initialIntent]);

  const openExperience = useCallback((target: ExperienceTarget) => {
    setIntent(createIntent(target));
  }, []);

  const resetExperience = useCallback(() => {
    setIntent(initialIntent);
  }, [initialIntent]);

  const actions = useMemo<FeedActions>(
    () => ({ ...baseActions, openExperience, resetExperience }),
    [baseActions, openExperience, resetExperience],
  );

  const experience = useMemo(
    () => feedExperienceEngine.resolve({ intent, context }),
    [intent, context],
  );

  const value = useMemo(
    () => ({ intent, context, experience, actions }),
    [intent, context, experience, actions],
  );

  return (
    <FeedExperienceContext.Provider value={value}>
      {children}
    </FeedExperienceContext.Provider>
  );
}

export function useFeedExperienceContext() {
  const value = useContext(FeedExperienceContext);
  if (!value) {
    throw new Error("useFeedExperienceContext must be used inside FeedExperienceProvider.");
  }
  return value;
}

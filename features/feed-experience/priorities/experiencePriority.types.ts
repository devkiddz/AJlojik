import type {
  FeedContext,
  FeedModule
} from '../contracts';

export type ExperiencePrioritySignalId =
  | 'active-delivery'
  | 'active-cart'
  | 'shopping-journey'
  | 'premium-membership'
  | 'recommendation-readiness'
  | 'recent-activity'
  | 'promotion-relevance'
  | 'category-focus'
  | 'catalog-fallback';

export type ExperiencePrioritySignal = {
  id: ExperiencePrioritySignalId;

  /**
   * Points contributed to the module score.
   */
  score: number;

  /**
   * Human-readable explanation used during development.
   */
  reason: string;
};

export type ExperiencePriorityResult = {
  moduleId: string;

  /**
   * Derives the type directly from the FeedModule union.
   */
  moduleType: FeedModule['type'];

  /**
   * Original priority declared by the builder.
   */
  basePriority: number;

  /**
   * Contextual points added by the priority engine.
   */
  contextualScore: number;

  /**
   * Final score used for ordering.
   */
  finalPriority: number;

  signals: ExperiencePrioritySignal[];
};

export type PrioritizeExperienceModulesInput = {
  modules: FeedModule[];
  context: FeedContext;
};

export type PrioritizeExperienceModulesResult = {
  modules: FeedModule[];
  priorities: ExperiencePriorityResult[];
};


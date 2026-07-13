import type { FeedModule } from '../contracts';

/**
 * A module proposed by a builder.
 *
 * The composer decides whether it deserves
 * to enter the final experience.
 */
export type ExperienceModuleCandidate = {
  module: FeedModule;

  /**
   * Whether this module should be included.
   */
  enabled?: boolean;

  /**
   * Human-readable explanation for debugging.
   */
  reason?: string;
};

export type ComposeExperienceModulesInput = {
  candidates: ExperienceModuleCandidate[];

  /**
   * Optional maximum number of modules.
   */
  limit?: number;
};

export type ComposeExperienceModulesResult = {
  modules: FeedModule[];

  diagnostics: {
    accepted: string[];
    rejected: {
      id: string;
      reason: string;
    }[];
  };
};
export type IntelligenceObservabilitySummary = {
  windowHours: number;
  providerRuns: number;
  successfulRuns: number;
  failedRuns: number;
  fallbackRuns: number;
  averageLatencyMs: number;
  warningAndErrorEvents: number;
  resolutionsCreated: number;
  resolutionsCompleted: number;
  actionsApplied: number;
  actionsFailed: number;
  providers: string[];
};

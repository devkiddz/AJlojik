export type SupportAnalyticsMetric = {
  label: string;
  value: number;
  unit: 'COUNT' | 'MINUTES' | 'HOURS' | 'RATING';
};

export type SupportAuditTimelineItem = {
  id: string;
  type:
    | 'STATUS'
    | 'ASSIGNMENT'
    | 'ESCALATION'
    | 'RESOLUTION'
    | 'COMMERCE_ACTION'
    | 'FEEDBACK';
  caseId: string;
  caseNumber: string;
  summary: string;
  actorName: string | null;
  createdAt: string;
};

export type SupportAnalyticsSnapshot = {
  workspaceId: string;
  generatedAt: string;
  metrics: {
    totalCases: number;
    openCases: number;
    resolvedCases: number;
    overdueCases: number;
    averageFirstResponseMinutes: number;
    averageResolutionHours: number;
    averageRating: number;
    supportNotifications: number;
    communicationNotifications: number;
  };
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  auditTimeline: SupportAuditTimelineItem[];
};

import type {
  SupportCommerceActionTypeValue
} from './supportOperationsTypes';
import type {
  SupportCaseStatusValue
} from './supportTypes';

export type SupportIntelligenceRisk =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type SupportIntelligenceSnapshot = {
  caseId: string;
  generatedAt: string;
  provider: 'RCENTZ_SUPPORT_DETERMINISTIC_V1';
  executiveSummary: string;
  risk: {
    level: SupportIntelligenceRisk;
    reasons: string[];
  };
  verifiedFacts: string[];
  missingEvidence: string[];
  recommendedStatus:
    SupportCaseStatusValue | null;
  recommendedActions:
    SupportCommerceActionTypeValue[];
  draftReply: string;
  guardrails: string[];
};

export type SupportOperationsOverview = {
  workspaceId: string;
  generatedAt: string;
  totals: {
    openCases: number;
    urgentCases: number;
    overdueCases: number;
    unassignedCases: number;
    preparedActions: number;
    approvedActions: number;
  };
  byStatus: Record<string, number>;
  agentLoad: Array<{
    agentId: string | null;
    agentName: string;
    activeCases: number;
  }>;
  recentCases: Array<{
    id: string;
    caseNumber: string;
    subject: string;
    status: string;
    priority: string;
    customerName: string;
    assignedAgentName: string | null;
    dueAt: string | null;
    updatedAt: string;
  }>;
};

import type {
  IntelligenceConstraint,
  IntelligenceContextSnapshot,
  IntelligencePlan,
  IntelligenceRecommendation,
  IntelligenceResolutionType,
  IntelligenceRiskLevel
} from '../domain';

export type IntelligencePlanningGoal = {
  title: string;
  objective: string;
  expectedOutcome?: string;
  resolutionType:
    IntelligenceResolutionType;
  audience:
    | 'customer'
    | 'admin'
    | 'vendor';
};

export type IntelligencePlanningInput = {
  goal:
    IntelligencePlanningGoal;
  context:
    IntelligenceContextSnapshot;
  existingConstraints?:
    IntelligenceConstraint[];
};

export type IntelligencePlanningResult = {
  expectedOutcome: string;
  constraints:
    IntelligenceConstraint[];
  recommendations:
    IntelligenceRecommendation[];
  plan:
    IntelligencePlan;
  confidence: number;
  riskLevel:
    IntelligenceRiskLevel;
  missingInformation:
    string[];
  warnings:
    string[];
};

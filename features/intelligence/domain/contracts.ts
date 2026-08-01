export type IntelligenceAudience =
  | 'customer'
  | 'admin'
  | 'vendor';

export type IntelligenceResolutionType =
  | 'PRODUCT_DISCOVERY'
  | 'PRODUCT_COMPARISON'
  | 'PRODUCT_PAIRING'
  | 'SHOPPING_PLAN'
  | 'BASKET_OPTIMIZATION'
  | 'SHOPPING_LIST_PREPARATION'
  | 'DELIVERY_SUPPORT'
  | 'CATALOG_IMPROVEMENT'
  | 'PRODUCT_DRAFT'
  | 'PRODUCT_REVISION'
  | 'CAMPAIGN_PLAN'
  | 'INVENTORY_INTERVENTION'
  | 'REVIEW_MODERATION'
  | 'VENDOR_INTERVENTION'
  | 'OPERATIONS_BRIEF'
  | 'GOVERNANCE_EXPLANATION'
  | 'CUSTOM';

export type IntelligenceResolutionStatus =
  | 'COLLECTING'
  | 'PLANNING'
  | 'READY'
  | 'AWAITING_REVIEW'
  | 'APPROVED'
  | 'EXECUTING'
  | 'APPLIED'
  | 'PARTIALLY_APPLIED'
  | 'BLOCKED'
  | 'DISMISSED'
  | 'STALE'
  | 'ARCHIVED';

export type IntelligenceRiskLevel =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export type IntelligenceCompletion =
  | 0
  | 25
  | 50
  | 75
  | 100;

export type IntelligenceAuthorityClass =
  | 'READ_ONLY'
  | 'RECOMMEND'
  | 'PREPARE'
  | 'APPLY_REVERSIBLE'
  | 'REQUIRE_CONFIRMATION'
  | 'REQUIRE_APPROVAL'
  | 'PROHIBITED';

export type IntelligencePreparedActionStatus =
  | 'PREPARED'
  | 'AWAITING_CONFIRMATION'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'EXECUTING'
  | 'APPLIED'
  | 'FAILED'
  | 'CANCELLED';

export type IntelligenceUpdateType =
  | 'GOAL_CAPTURED'
  | 'CONTEXT_COLLECTED'
  | 'CONSTRAINT_IDENTIFIED'
  | 'ASSUMPTION_ADDED'
  | 'EVIDENCE_FOUND'
  | 'PLAN_UPDATED'
  | 'ACTION_PREPARED'
  | 'APPROVAL_REQUIRED'
  | 'ACTION_APPROVED'
  | 'EXECUTION_STARTED'
  | 'ACTION_APPLIED'
  | 'ACTION_FAILED'
  | 'OUTCOME_VERIFIED'
  | 'RESOLUTION_COMPLETED'
  | 'RESOLUTION_BLOCKED'
  | 'RESOLUTION_DISMISSED'
  | 'RESOLUTION_ARCHIVED';

export type IntelligenceEvidenceKind =
  | 'CATALOG'
  | 'COMMERCE'
  | 'EXPERIENCE'
  | 'BEHAVIOUR'
  | 'OPERATIONS'
  | 'USER_INPUT'
  | 'SYSTEM';

export type IntelligenceConstraintKind =
  | 'BUDGET'
  | 'AVAILABILITY'
  | 'TIME'
  | 'PERMISSION'
  | 'PREFERENCE'
  | 'EXCLUSION'
  | 'QUANTITY'
  | 'GOVERNANCE'
  | 'CUSTOM';

export type IntelligenceAssumptionStatus =
  | 'UNCONFIRMED'
  | 'CONFIRMED'
  | 'REJECTED'
  | 'EXPIRED';

export type IntelligenceReference = {
  type: string;
  id: string;
  label?: string;
  href?: string;
};

export type IntelligenceContextReferences = {
  productIds: string[];
  categoryIds: string[];
  shoppingListIds: string[];
  orderIds: string[];
  campaignIds: string[];
  approvalRequestIds: string[];
};

export type IntelligenceContextSnapshot = {
  capturedAt: string;
  identity: Record<string, unknown>;
  experience: Record<string, unknown>;
  commerce: Record<string, unknown>;
  behaviour: Record<string, unknown>;
  operations: Record<string, unknown>;
  references: IntelligenceContextReferences;
};

export type IntelligenceConstraint = {
  id: string;
  kind: IntelligenceConstraintKind;
  label: string;
  value: string;
  required: boolean;
  source:
    | 'USER'
    | 'CONTEXT'
    | 'POLICY'
    | 'INFERENCE';
};

export type IntelligenceAssumption = {
  id: string;
  statement: string;
  status: IntelligenceAssumptionStatus;
  confidence: number;
  source:
    | 'MODEL'
    | 'RULE'
    | 'CONTEXT';
  expiresAt?: string | null;
};

export type IntelligenceEvidence = {
  id: string;
  kind: IntelligenceEvidenceKind;
  title: string;
  detail?: string;
  confidence: number;
  references: IntelligenceReference[];
  capturedAt: string;
};

export type IntelligenceRecommendation = {
  id: string;
  title: string;
  rationale: string;
  priority:
    | 'LOW'
    | 'MEDIUM'
    | 'HIGH'
    | 'CRITICAL';
  confidence: number;
  references: IntelligenceReference[];
};

export type IntelligencePlanStepStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'BLOCKED'
  | 'SKIPPED';

export type IntelligencePlanStep = {
  id: string;
  order: number;
  title: string;
  description?: string;
  status: IntelligencePlanStepStatus;
};

export type IntelligencePlan = {
  summary: string;
  steps: IntelligencePlanStep[];
};

export type IntelligenceActionValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
};

export type IntelligencePreparedAction = {
  id: string;
  resolutionId: string;
  actionType: string;
  authorityClass: IntelligenceAuthorityClass;
  status: IntelligencePreparedActionStatus;
  label: string;
  description: string;
  targetType?: string | null;
  targetId?: string | null;
  input: Record<string, unknown>;
  preview: Record<string, unknown>;
  validation: IntelligenceActionValidation;
  idempotencyKey: string;
  applicationId?: string | null;
  approvedByUserId?: string | null;
  approvedAt?: string | null;
  appliedAt?: string | null;
  error?: string | null;
};

export type IntelligenceResolutionUpdate = {
  id: string;
  resolutionId: string;
  type: IntelligenceUpdateType;
  title: string;
  detail?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type IntelligenceResolution = {
  id: string;
  workspaceId: string;
  ownerUserId: string;
  vendorProfileId?: string | null;
  audience: IntelligenceAudience;
  type: IntelligenceResolutionType;
  status: IntelligenceResolutionStatus;
  title: string;
  objective: string;
  expectedOutcome: string;
  contextSnapshot: IntelligenceContextSnapshot;
  constraints: IntelligenceConstraint[];
  assumptions: IntelligenceAssumption[];
  evidence: IntelligenceEvidence[];
  recommendations: IntelligenceRecommendation[];
  plan: IntelligencePlan;
  preparedActions: IntelligencePreparedAction[];
  updates: IntelligenceResolutionUpdate[];
  confidence: number;
  riskLevel: IntelligenceRiskLevel;
  completion: IntelligenceCompletion;
  blockedReason?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
};

export type IntelligenceResolutionDraft =
  Omit<
    IntelligenceResolution,
    | 'workspaceId'
    | 'ownerUserId'
    | 'createdAt'
    | 'updatedAt'
  > & {
    workspaceId?: string;
    ownerUserId?: string;
    createdAt?: string;
    updatedAt?: string;
    legacySessionId?: string | null;
    legacyMessageId?: string | null;
  };

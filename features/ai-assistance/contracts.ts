export type AIAssistantAudience =
  | 'admin'
  | 'vendor'
  | 'customer';

export type AIAssistantCapability = {
  id: string;
  title: string;
  description: string;
  examples: string[];
};

export type AIAssistantProfile = {
  audience: AIAssistantAudience;
  eyebrow: string;
  title: string;
  description: string;
  contextDescription: string;
  capabilities: AIAssistantCapability[];
  authorityRules: string[];
  preparationSteps: string[];
};

export type AIAssistantOutputType =
  | 'RECOMMENDATION'
  | 'COMPARISON'
  | 'PAIRING'
  | 'SHOPPING_PLAN'
  | 'CATALOG_DRAFT'
  | 'CAMPAIGN_DRAFT'
  | 'OPERATIONS_BRIEF'
  | 'GOVERNANCE_EXPLANATION';

export type AIAssistantFeedbackValue =
  | 'HELPFUL'
  | 'NOT_HELPFUL'
  | 'APPLIED'
  | 'DISMISSED';

export type AIAssistantBridgeActionType =
  | 'SHOPPING_LIST_CREATE'
  | 'ADMIN_TODO_CREATE'
  | 'PRODUCT_DRAFT_CREATE'
  | 'PRODUCT_REVISION_SUBMIT'
  | 'CAMPAIGN_DRAFT_CREATE';

export type AIAssistantApplicationStatus =
  | 'PENDING'
  | 'APPLIED'
  | 'FAILED';

export type AIAssistantTodoPriority =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT';

export type AIAssistantCampaignType =
  | 'BANNER'
  | 'STORY'
  | 'REEL';

/* AJ_MS12_PRODUCT_LIBRARY_PRESENTATION_V1 */
export type AIAssistantProductKnowledgeSourceType =
  | 'CATALOG'
  | 'VENDOR'
  | 'MANUFACTURER'
  | 'WIKIPEDIA'
  | 'WIKIDATA';

export type AIAssistantProductKnowledgeSource = {
  type: AIAssistantProductKnowledgeSourceType;
  title: string;
  href?: string | null;
  verified: boolean;
};

export type AIAssistantProductSpecification = {
  label: string;
  value: string;
};

export type AIAssistantProductLibraryEntry = {
  status: 'CATALOG_ONLY' | 'ENRICHED';
  overview: string | null;
  description: string | null;
  tags: string[];
  specifications: AIAssistantProductSpecification[];
  ingredients: string[];
  safetyNotes: string[];
  sources: AIAssistantProductKnowledgeSource[];
  missingInformation: string[];
};

export type AIAssistantProduct = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  category: string;
  brand: string | null;
  variantId: string | null;
  variantLabel: string | null;
  price: number | null;
  available: number;
  rating: number;
  reason: string;
  href: string;
  library?: AIAssistantProductLibraryEntry;
};

export type AIAssistantRecognizedProductDraft = {
  name: string;
  slug: string;

  categoryId: string;
  categoryLabel: string;

  subcategoryId: string | null;
  subcategoryLabel: string | null;

  brandId: string | null;
  brandName: string | null;

  shortDescription: string;
  longDescription: string;

  estimatedDelivery: string | null;

  tags: string[];

  recognitionConfidence: number;
  assumptions: string[];
};

export type AIAssistantMetric = {
  label: string;
  value: string;
  helper?: string;
  tone?: 'neutral' | 'positive' | 'warning' | 'critical';
};

export type AIAssistantSection = {
  title: string;
  description?: string;
  bullets: string[];
};

export type AIAssistantDraftField = {
  label: string;
  value: string;
};

export type AIAssistantAction = {
  label: string;
  href: string;
  kind?: 'primary' | 'secondary';
};

export type AIAssistantResponsePayload = {
  headline: string;
  summary: string;
  outputType: AIAssistantOutputType;
  confidence: number;
  metrics: AIAssistantMetric[];
  products: AIAssistantProduct[];
  productDraft: AIAssistantRecognizedProductDraft | null;
  sections: AIAssistantSection[];
  draftFields: AIAssistantDraftField[];
  warnings: string[];
  suggestedPrompts: string[];
  actions: AIAssistantAction[];
};

export type AIAssistantApplicationView = {
  id: string;
  actionType: AIAssistantBridgeActionType;
  status: AIAssistantApplicationStatus;
  targetType: string | null;
  targetId: string | null;
  href: string | null;
  label: string;
  error: string | null;
  createdAt: string;
  appliedAt: string | null;
};

export type AIAssistantMessageView = {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  outputType: AIAssistantOutputType | null;
  payload: AIAssistantResponsePayload | null;
  provider: string;
  confidence: number | null;
  feedback: AIAssistantFeedbackValue | null;
  journeyVersion: number | null;
  previousPlanMessageId: string | null;
  isPlanSnapshot: boolean;
  journeyStateSnapshot: AIAssistantJourneyState | null;
  journeyStageSnapshot: AIAssistantJourneyStage | null;
  journeyStateVersionSnapshot: number | null;
  journeyTransition: AIAssistantJourneyTransition | null;
  applications: AIAssistantApplicationView[];
  createdAt: string;
};

export type AIAssistantJourneyStage =
  | 'UNDERSTANDING'
  | 'PLANNING'
  | 'REFINING'
  | 'AWAITING_DECISION'
  | 'READY'
  | 'COMPLETED';

export type AIAssistantJourneyTransitionReason =
  | 'STARTED'
  | 'NEEDS_CONTEXT'
  | 'CONTEXT_CONFIRMED'
  | 'PLAN_CREATED'
  | 'PLAN_REFINED'
  | 'AWAITING_CHOICE'
  | 'DECISION_CONFIRMED'
  | 'ACTION_READY'
  | 'COMPLETED'
  | 'REOPENED'
  | 'RESTORED'
  | 'STAGE_PRESERVED';

export type AIAssistantJourneyTransition = {
  from: AIAssistantJourneyStage | null;
  proposed: AIAssistantJourneyStage;
  to: AIAssistantJourneyStage;
  reason: AIAssistantJourneyTransitionReason;
  changed: boolean;
  planVersion: number;
  at: string;
};

export type AIAssistantJourneyState = {
  schemaVersion: 1;
  objective: string | null;
  confirmedContext: string[];
  constraints: string[];
  preferences: string[];
  confirmedDecisions: string[];
  rejectedSuggestions: string[];
  unresolvedQuestions: string[];
  assumptions: string[];
  latestInstruction: string;
  currentStage: AIAssistantJourneyStage;
  planVersion: number;
  updatedAt: string;
};

export type AIAssistantSessionSummary = {
  id: string;
  title: string;
  audience: AIAssistantAudience;
  status: 'ACTIVE' | 'ARCHIVED';
  journeyGoal: string;
  activePlanMessageId: string | null;
  currentPlanVersion: number;
  lastRefinedAt: string | null;
  messageCount: number;
  lastMessage: string | null;
  journeyStage: AIAssistantJourneyStage;
  journeyStateVersion: number;
  journeyState: AIAssistantJourneyState | null;

  journeyLastTransition: AIAssistantJourneyTransition | null;
  createdAt: string;
  updatedAt: string;
};

export type AIAssistantSessionView =
  AIAssistantSessionSummary & {
    contextSnapshot: Record<string, unknown> | null;
    messages: AIAssistantMessageView[];
  };

export type AIAssistantRuntimeContext = {
  workspaceId: string;
  vendorProfileId?: string | null;
  productId?: string | null;
  category?: string | null;
  intent?: string | null;
  mode?: string | null;
};

export type AIAssistantAccessView = {
  audience: AIAssistantAudience;
  workspaceId: string;
  userId: string;
  vendorProfileId: string | null;
  contextLabel: string;
};

export type AIAssistantShoppingListOptions = {
  title: string;
  description?: string;
  productIds: string[];
};

export type AIAssistantTodoOptions = {
  title: string;
  description?: string;
  priority: AIAssistantTodoPriority;
};

export type AIAssistantProductDraftOptions = {
  name: string;
  shortDescription: string;
  longDescription: string;
  estimatedDelivery?: string | null;
  tags: string[];
};

export type AIAssistantProductRevisionOptions = {
  productId: string;
  reason: string;
};

export type AIAssistantCampaignOptions = {
  title: string;
  description?: string;
  campaignType: AIAssistantCampaignType;
  productIds: string[];
};

export type AIAssistantBridgeOptions =
  | AIAssistantShoppingListOptions
  | AIAssistantTodoOptions
  | AIAssistantProductDraftOptions
  | AIAssistantProductRevisionOptions
  | AIAssistantCampaignOptions;

export type AIAssistantBridgeRequest = {
  audience: AIAssistantAudience;
  workspaceId: string;
  vendorProfileId?: string | null;
  actionType: AIAssistantBridgeActionType;
  options: AIAssistantBridgeOptions;
};

export type AIAssistantHubInsight = {
  sessionId: string;
  messageId: string;
  headline: string;
  summary: string;
  outputType: AIAssistantOutputType;
  products: AIAssistantProduct[];
  application: AIAssistantApplicationView | null;
  updatedAt: string;
};

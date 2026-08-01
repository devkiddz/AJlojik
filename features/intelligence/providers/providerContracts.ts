export type IntelligenceProviderKind = 'DETERMINISTIC' | 'EXTERNAL';
export type IntelligenceProviderOperation = 'PLAN' | 'SUMMARIZE' | 'RANK' | 'EXTRACT' | 'EXPLAIN';

export type IntelligenceProviderRequest = {
  workspaceId: string;
  resolutionId?: string | null;
  operation: IntelligenceProviderOperation;
  promptVersion: string;
  input: Record<string, unknown>;
  policy?: {
    allowExternal?: boolean;
    preferredProvider?: string | null;
    maximumLatencyMs?: number;
  };
};

export type IntelligenceProviderResult = {
  providerKey: string;
  providerKind: IntelligenceProviderKind;
  model?: string | null;
  output: Record<string, unknown>;
  usage?: { inputTokens?: number; outputTokens?: number; costMicros?: number };
  latencyMs: number;
  fallbackUsed: boolean;
};

export type IntelligenceProvider = {
  key: string;
  kind: IntelligenceProviderKind;
  supports(operation: IntelligenceProviderOperation): boolean;
  execute(request: IntelligenceProviderRequest): Promise<{
    output: Record<string, unknown>;
    usage?: { inputTokens?: number; outputTokens?: number; costMicros?: number };
    model?: string | null;
  }>;
};

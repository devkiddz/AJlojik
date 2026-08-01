import 'server-only';

import { deterministicIntelligenceProvider } from './deterministicProvider';
import type { IntelligenceProvider, IntelligenceProviderRequest, IntelligenceProviderResult } from './providerContracts';
import { IntelligenceObservabilityRepository } from '../observability/observabilityRepository';

type CircuitState = { failures: number; openUntil: number };
const circuits = new Map<string, CircuitState>();
const providers = new Map<string, IntelligenceProvider>([[deterministicIntelligenceProvider.key, deterministicIntelligenceProvider]]);

export function registerIntelligenceProvider(provider: IntelligenceProvider): void {
  providers.set(provider.key, provider);
}

export function listIntelligenceProviders(): readonly IntelligenceProvider[] {
  return [...providers.values()];
}

export async function executeIntelligenceProvider(request: IntelligenceProviderRequest): Promise<IntelligenceProviderResult> {
  const selected = selectProvider(request);
  try {
    return await executeOne(selected, request, false);
  } catch (error) {
    recordFailure(selected.key);
    if (selected.key === deterministicIntelligenceProvider.key) throw error;
    await IntelligenceObservabilityRepository.audit({
      workspaceId: request.workspaceId,
      resolutionId: request.resolutionId,
      type: 'PROVIDER_FALLBACK',
      severity: 'WARNING',
      message: `Provider ${selected.key} failed; deterministic fallback was used.`,
      metadata: { error: error instanceof Error ? error.message : String(error) }
    });
    return executeOne(deterministicIntelligenceProvider, request, true, selected.key);
  }
}

function selectProvider(request: IntelligenceProviderRequest): IntelligenceProvider {
  const preferred = request.policy?.preferredProvider ? providers.get(request.policy.preferredProvider) : undefined;
  if (preferred && preferred.supports(request.operation) && !isCircuitOpen(preferred.key) && (preferred.kind === 'DETERMINISTIC' || request.policy?.allowExternal === true)) return preferred;
  return deterministicIntelligenceProvider;
}

async function executeOne(provider: IntelligenceProvider, request: IntelligenceProviderRequest, fallbackUsed: boolean, fallbackFrom?: string): Promise<IntelligenceProviderResult> {
  const started = Date.now();
  const run = await IntelligenceObservabilityRepository.startProviderRun({
    workspaceId: request.workspaceId,
    resolutionId: request.resolutionId,
    providerKey: provider.key,
    providerKind: provider.kind,
    operation: request.operation,
    promptVersion: request.promptVersion,
    request: request.input,
    fallbackFrom: fallbackFrom ?? null
  });
  try {
    const response = await provider.execute(request);
    const latencyMs = Date.now() - started;
    await IntelligenceObservabilityRepository.completeProviderRun(run.id, {
      status: fallbackUsed ? 'FALLBACK' : 'SUCCEEDED',
      latencyMs,
      response: response.output,
      inputTokens: response.usage?.inputTokens,
      outputTokens: response.usage?.outputTokens,
      costMicros: response.usage?.costMicros
    });
    circuits.delete(provider.key);
    return { providerKey: provider.key, providerKind: provider.kind, model: response.model, output: response.output, usage: response.usage, latencyMs, fallbackUsed };
  } catch (error) {
    await IntelligenceObservabilityRepository.completeProviderRun(run.id, {
      status: 'FAILED',
      latencyMs: Date.now() - started,
      errorCode: error instanceof Error ? error.name : 'UNKNOWN_PROVIDER_ERROR',
      metadata: { error: error instanceof Error ? error.message : String(error) }
    });
    throw error;
  }
}

function isCircuitOpen(key: string): boolean {
  const state = circuits.get(key);
  if (!state) return false;
  if (state.openUntil <= Date.now()) { circuits.delete(key); return false; }
  return true;
}

function recordFailure(key: string): void {
  const current = circuits.get(key) ?? { failures: 0, openUntil: 0 };
  const failures = current.failures + 1;
  circuits.set(key, { failures, openUntil: failures >= 3 ? Date.now() + 5 * 60 * 1000 : 0 });
}

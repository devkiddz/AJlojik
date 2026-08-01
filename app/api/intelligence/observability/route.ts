import { NextResponse } from 'next/server';
import { requireText, resolveIntelligenceApiAccess } from '@/features/intelligence/api';
import { IntelligenceObservabilityRepository } from '@/features/intelligence/observability/observabilityRepository';
import { assistantErrorResponse } from '@/features/ai-assistance/server/assistantRouteResponse';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const audience = requireText(url.searchParams.get('audience'), 'Audience', 20);
    if (audience !== 'admin') throw new Error('Intelligence observability requires Admin scope.');
    const access = await resolveIntelligenceApiAccess(request, {
      audience: 'admin',
      workspaceId: requireText(url.searchParams.get('workspaceId'), 'Workspace', 200)
    });
    const hours = Number(url.searchParams.get('hours') ?? 24);
    return NextResponse.json({ summary: await IntelligenceObservabilityRepository.summary(access.workspaceId, Number.isFinite(hours) ? hours : 24) });
  } catch (error) {
    return assistantErrorResponse(error, 'Could not load Intelligence observability.');
  }
}

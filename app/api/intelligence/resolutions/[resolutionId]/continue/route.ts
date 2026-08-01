import {
  NextResponse
} from 'next/server';

import type {
  Prisma
} from '@/lib/generated/prisma/client';

import {
  prisma
} from '@/lib/prisma';

import {
  applyPlanningResult,
  DeterministicResolutionPlanner,
  IntelligenceContextResolver,
  IntelligenceRepository,
  readJsonObject,
  requireText,
  resolveIntelligenceApiAccess
} from '@/features/intelligence';

import {
  assistantErrorResponse
} from '@/features/ai-assistance/server/assistantRouteResponse';

/* RI_05_06_PRISMA_JSON_BOUNDARY */

type RouteContext = {
  params:
    Promise<{
      resolutionId:
        string;
    }>;
};

export async function POST(
  request:
    Request,
  context:
    RouteContext
) {
  try {
    const {
      resolutionId
    } =
      await context.params;

    const body =
      await readJsonObject(
        request
      );

    const access =
      await resolveIntelligenceApiAccess(
        request,
        {
          audience:
            requireText(
              body.audience,
              'Audience',
              20
            ) as
              'customer' |
              'admin' |
              'vendor',
          workspaceId:
            requireText(
              body.workspaceId,
              'Workspace',
              200
            ),
          vendorProfileId:
            typeof body.vendorProfileId ===
              'string'
              ? body.vendorProfileId
              : null
        }
      );

    const current =
      await IntelligenceRepository.read(
        access,
        resolutionId
      );

    const contextResult =
      await new IntelligenceContextResolver()
        .resolve({
          audience:
            access.audience,
          workspaceId:
            access.workspaceId,
          userId:
            access.userId,
          vendorProfileId:
            access.vendorProfileId,
          permissions:
            access.permissions,
          resolutionType:
            current.type,
          runtime:
            (
              body.runtime &&
              typeof body.runtime ===
                'object' &&
              !Array.isArray(
                body.runtime
              )
            )
              ? body.runtime as
                  Record<string, string | null>
              : undefined
        });

    const next =
      applyPlanningResult(
        {
          ...current,
          contextSnapshot:
            contextResult.snapshot
        },
        new DeterministicResolutionPlanner()
          .plan({
            goal: {
              title:
                current.title,
              objective:
                typeof body.objective ===
                  'string'
                  ? body.objective
                  : current.objective,
              expectedOutcome:
                current.expectedOutcome,
              resolutionType:
                current.type,
              audience:
                current.audience
            },
            context:
              contextResult.snapshot,
            existingConstraints:
              current.constraints
          })
      );

    await prisma.intelligenceResolution.update({
      where: {
        id:
          resolutionId
      },
      data: {
        status:
          next.status,
        objective:
          next.objective,
        expectedOutcome:
          next.expectedOutcome,
        contextSnapshot:
          next.contextSnapshot as unknown as
            Prisma.InputJsonValue,
        constraints:
          next.constraints as unknown as
            Prisma.InputJsonValue,
        recommendations:
          next.recommendations as unknown as
            Prisma.InputJsonValue,
        plan:
          next.plan as unknown as
            Prisma.InputJsonValue,
        confidence:
          next.confidence,
        riskLevel:
          next.riskLevel,
        completion:
          next.completion,
        blockedReason:
          null,
        updates: {
          create:
            next.updates
              .slice(
                current.updates.length
              )
              .map(
                update => ({
                  id:
                    update.id,
                  type:
                    update.type,
                  title:
                    update.title,
                  detail:
                    update.detail,
                  metadata:
                    update.metadata
                      ? update.metadata as unknown as
                          Prisma.InputJsonValue
                      : undefined,
                  createdAt:
                    new Date(
                      update.createdAt
                    )
                })
              )
        }
      }
    });

    return NextResponse.json({
      resolution:
        await IntelligenceRepository.read(
          access,
          resolutionId
        ),
      contextWarnings:
        contextResult.warnings
    });
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not continue the Intelligence resolution.'
    );
  }
}

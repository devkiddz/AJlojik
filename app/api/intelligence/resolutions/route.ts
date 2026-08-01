import {
  NextResponse
} from 'next/server';

import {
  randomUUID
} from 'node:crypto';

import type {
  IntelligenceResolutionType
} from '@/features/intelligence';

import {
  applyPlanningResult,
  createIntelligenceResolution,
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

export async function GET(
  request:
    Request
) {
  try {
    const url =
      new URL(
        request.url
      );

    const audience =
      requireText(
        url.searchParams.get(
          'audience'
        ),
        'Audience',
        20
      ) as
        'customer' |
        'admin' |
        'vendor';

    const workspaceId =
      requireText(
        url.searchParams.get(
          'workspaceId'
        ),
        'Workspace',
        200
      );

    const access =
      await resolveIntelligenceApiAccess(
        request,
        {
          audience,
          workspaceId,
          vendorProfileId:
            url.searchParams.get(
              'vendorProfileId'
            )
        }
      );

    return NextResponse.json({
      resolutions:
        await IntelligenceRepository.list(
          access
        )
    });
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not list Intelligence resolutions.'
    );
  }
}

export async function POST(
  request:
    Request
) {
  try {
    const body =
      await readJsonObject(
        request
      );

    const audience =
      requireText(
        body.audience,
        'Audience',
        20
      ) as
        'customer' |
        'admin' |
        'vendor';

    const workspaceId =
      requireText(
        body.workspaceId,
        'Workspace',
        200
      );

    const access =
      await resolveIntelligenceApiAccess(
        request,
        {
          audience,
          workspaceId,
          vendorProfileId:
            typeof body.vendorProfileId ===
              'string'
              ? body.vendorProfileId
              : null
        }
      );

    const type =
      requireText(
        body.type,
        'Resolution type',
        80
      ) as
        IntelligenceResolutionType;

    const resolution =
      createIntelligenceResolution({
        id:
          randomUUID(),
        workspaceId:
          access.workspaceId,
        ownerUserId:
          access.userId,
        vendorProfileId:
          access.vendorProfileId,
        audience:
          access.audience,
        type,
        title:
          requireText(
            body.title,
            'Title',
            160
          ),
        objective:
          requireText(
            body.objective,
            'Objective'
          ),
        expectedOutcome:
          typeof body.expectedOutcome ===
            'string'
            ? body.expectedOutcome
            : 'A reviewed and actionable resolution.'
      });

    const context =
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
            type,
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

    const withContext = {
      ...resolution,
      contextSnapshot:
        context.snapshot
    };

    const planned =
      applyPlanningResult(
        withContext,
        new DeterministicResolutionPlanner()
          .plan({
            goal: {
              title:
                withContext.title,
              objective:
                withContext.objective,
              expectedOutcome:
                withContext.expectedOutcome,
              resolutionType:
                withContext.type,
              audience:
                withContext.audience
            },
            context:
              withContext.contextSnapshot,
            existingConstraints:
              withContext.constraints
          })
      );

    return NextResponse.json(
      {
        resolution:
          await IntelligenceRepository.create(
            access,
            planned,
            {
              sessionId:
                typeof body.sessionId ===
                  'string'
                  ? body.sessionId
                  : null
            }
          ),
        contextWarnings:
          context.warnings
      },
      {
        status:
          201
      }
    );
  } catch (
    error
  ) {
    return assistantErrorResponse(
      error,
      'Could not create the Intelligence resolution.'
    );
  }
}

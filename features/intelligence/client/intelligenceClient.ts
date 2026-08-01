import type {
  IntelligencePreparedAction,
  IntelligenceResolution
} from '../domain';

import type {
  IntelligenceResolutionSummary
} from '../server/intelligenceMapper';

export type IntelligenceClientScope = {
  audience:
    | 'customer'
    | 'admin'
    | 'vendor';
  workspaceId:
    string;
  vendorProfileId?:
    string |
    null;
};

export type CreateIntelligenceResolutionInput =
  IntelligenceClientScope & {
    type:
      IntelligenceResolution['type'];
    title:
      string;
    objective:
      string;
    expectedOutcome?:
      string;
    sessionId?:
      string |
      null;
    runtime?:
      Record<
        string,
        string |
        null
      >;
  };

async function readJson<T>(
  response:
    Response
): Promise<T> {
  const payload =
    await response.json() as
      T & {
        error?:
          string;
      };

  if (!response.ok) {
    throw new Error(
      payload.error ??
      'RCENTZ Intelligence could not complete the request.'
    );
  }

  return payload;
}

function scopeQuery(
  scope:
    IntelligenceClientScope
): string {
  const params =
    new URLSearchParams({
      audience:
        scope.audience,
      workspaceId:
        scope.workspaceId
    });

  if (
    scope.vendorProfileId
  ) {
    params.set(
      'vendorProfileId',
      scope.vendorProfileId
    );
  }

  return params.toString();
}

export const IntelligenceClient = {
  async list(
    scope:
      IntelligenceClientScope
  ): Promise<IntelligenceResolutionSummary[]> {
    const response =
      await fetch(
        `/api/intelligence/resolutions?${scopeQuery(scope)}`,
        {
          cache:
            'no-store'
        }
      );

    const payload =
      await readJson<{
        resolutions:
          IntelligenceResolutionSummary[];
      }>(
        response
      );

    return payload.resolutions;
  },

  async read(
    scope:
      IntelligenceClientScope,
    resolutionId:
      string
  ): Promise<IntelligenceResolution> {
    const response =
      await fetch(
        `/api/intelligence/resolutions/${encodeURIComponent(
          resolutionId
        )}?${scopeQuery(scope)}`,
        {
          cache:
            'no-store'
        }
      );

    const payload =
      await readJson<{
        resolution:
          IntelligenceResolution;
      }>(
        response
      );

    return payload.resolution;
  },

  async create(
    input:
      CreateIntelligenceResolutionInput
  ): Promise<IntelligenceResolution> {
    const response =
      await fetch(
        '/api/intelligence/resolutions',
        {
          method:
            'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body:
            JSON.stringify(
              input
            )
        }
      );

    const payload =
      await readJson<{
        resolution:
          IntelligenceResolution;
      }>(
        response
      );

    return payload.resolution;
  },

  async transition(
    scope:
      IntelligenceClientScope,
    resolutionId:
      string,
    operation:
      'DISMISS' |
      'ARCHIVE',
    detail?:
      string
  ): Promise<IntelligenceResolution> {
    const response =
      await fetch(
        `/api/intelligence/resolutions/${encodeURIComponent(
          resolutionId
        )}`,
        {
          method:
            'PATCH',
          headers: {
            'Content-Type':
              'application/json'
          },
          body:
            JSON.stringify({
              ...scope,
              operation,
              detail
            })
        }
      );

    const payload =
      await readJson<{
        resolution:
          IntelligenceResolution;
      }>(
        response
      );

    return payload.resolution;
  },

  async approveAction(
    scope:
      IntelligenceClientScope,
    resolutionId:
      string,
    actionId:
      string
  ): Promise<IntelligencePreparedAction | undefined> {
    return actionOperation(
      scope,
      resolutionId,
      actionId,
      'approve'
    );
  },

  async applyAction(
    scope:
      IntelligenceClientScope,
    resolutionId:
      string,
    actionId:
      string
  ): Promise<IntelligencePreparedAction | undefined> {
    return actionOperation(
      scope,
      resolutionId,
      actionId,
      'apply'
    );
  }
};

async function actionOperation(
  scope:
    IntelligenceClientScope,
  resolutionId:
    string,
  actionId:
    string,
  operation:
    'approve' |
    'apply'
): Promise<IntelligencePreparedAction | undefined> {
  const response =
    await fetch(
      `/api/intelligence/resolutions/${encodeURIComponent(
        resolutionId
      )}/actions/${encodeURIComponent(
        actionId
      )}/${operation}`,
      {
        method:
          'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body:
          JSON.stringify(
            scope
          )
      }
    );

  const payload =
    await readJson<{
      action?:
        IntelligencePreparedAction;
    }>(
      response
    );

  return payload.action;
}

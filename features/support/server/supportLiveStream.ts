import 'server-only';

import {
  readSupportLiveEvents,
  resolveSupportLiveCursor
} from './supportLiveRepository';

import {
  readSupportLivePresence
} from './supportLivePresenceRepository';

import type {
  SupportLiveAudience,
  SupportLiveReadyPayload,
  SupportLiveReconnectPayload
} from '../supportLiveTypes';

const POLL_INTERVAL_MS = 1000;
const HEARTBEAT_INTERVAL_MS = 15_000;
const PRESENCE_INTERVAL_MS = 5_000;
const STREAM_LIFETIME_MS = 45_000;
const RECONNECT_AFTER_MS = 1500;

type SupportLiveStreamContext = {
  workspaceId: string;
  caseId: string;
  actorId: string;
  audience: SupportLiveAudience;
};

function parseCursor(
  request: Request
): number | null {
  const url = new URL(request.url);

  const queryCursor =
    url.searchParams.get('after');

  const headerCursor =
    request.headers.get(
      'last-event-id'
    );

  const raw =
    queryCursor ?? headerCursor;

  if (!raw) {
    return null;
  }

  const parsed =
    Number.parseInt(raw, 10);

  return Number.isFinite(parsed) &&
    parsed >= 0
    ? parsed
    : null;
}

function frame(
  event: string,
  data: unknown,
  id?: number
): string {
  const lines = [
    ...(id === undefined
      ? []
      : [`id: ${id}`]),
    `event: ${event}`,
    `data: ${JSON.stringify(data)}`,
    ''
  ];

  return `${lines.join('\n')}\n`;
}

function delay(
  milliseconds: number
): Promise<void> {
  return new Promise(resolve => {
    setTimeout(
      resolve,
      milliseconds
    );
  });
}

export function createSupportLiveStreamResponse(
  request: Request,
  context: SupportLiveStreamContext
): Response {
  const encoder =
    new TextEncoder();

  const stream =
    new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (
          value: string
        ): void => {
          controller.enqueue(
            encoder.encode(value)
          );
        };

        const run =
          async (): Promise<void> => {
            let cursor =
              parseCursor(request);

            if (cursor === null) {
              cursor =
                await resolveSupportLiveCursor(
                  context.workspaceId,
                  context.caseId
                );
            }

            const ready:
              SupportLiveReadyPayload = {
                caseId: context.caseId,
                cursor,
                audience:
                  context.audience,
                connectedAt:
                  new Date().toISOString()
              };

            send(
              `retry: ${RECONNECT_AFTER_MS}\n\n`
            );

            send(
              frame(
                'ready',
                ready
              )
            );

            const deadline =
              Date.now() +
              STREAM_LIFETIME_MS;

            let lastHeartbeatAt =
              Date.now();

            let lastPresenceAt = 0;

            while (
              !request.signal.aborted &&
              Date.now() < deadline
            ) {
              const events =
                await readSupportLiveEvents({
                  workspaceId:
                    context.workspaceId,
                  caseId:
                    context.caseId,
                  afterId: cursor,
                  limit: 100
                });

              for (const event of events) {
                cursor = event.id;

                send(
                  frame(
                    'support',
                    event,
                    event.id
                  )
                );
              }

              if (
                Date.now() -
                  lastPresenceAt >=
                PRESENCE_INTERVAL_MS
              ) {
                const presence =
                  await readSupportLivePresence(
                    context.workspaceId,
                    context.caseId
                  );

                send(
                  frame(
                    'presence-snapshot',
                    presence
                  )
                );

                lastPresenceAt =
                  Date.now();
              }

              if (
                Date.now() -
                  lastHeartbeatAt >=
                HEARTBEAT_INTERVAL_MS
              ) {
                send(
                  `: heartbeat ${Date.now()}\n\n`
                );

                lastHeartbeatAt =
                  Date.now();
              }

              await delay(
                POLL_INTERVAL_MS
              );
            }

            if (
              !request.signal.aborted
            ) {
              const reconnect:
                SupportLiveReconnectPayload = {
                  caseId:
                    context.caseId,
                  cursor,
                  reconnectAfterMs:
                    RECONNECT_AFTER_MS
                };

              send(
                frame(
                  'reconnect',
                  reconnect
                )
              );
            }
          };

        void run()
          .catch(cause => {
            if (
              !request.signal.aborted
            ) {
              try {
                send(
                  frame(
                    'transport-error',
                    {
                      caseId:
                        context.caseId,
                      message:
                        cause instanceof
                        Error
                          ? cause.message
                          : 'Support live transport failed.'
                    }
                  )
                );
              } catch {
                // The client may already
                // have disconnected.
              }
            }
          })
          .finally(() => {
            try {
              controller.close();
            } catch {
              // The stream may already
              // be closed by the runtime.
            }
          });
      }
    });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type':
        'text/event-stream; charset=utf-8',
      'Cache-Control':
        'private, no-cache, no-store, max-age=0, must-revalidate',
      Connection:
        'keep-alive',
      'X-Accel-Buffering':
        'no',
      'Content-Encoding':
        'identity'
    }
  });
}

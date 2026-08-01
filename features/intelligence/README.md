# RCENTZ Intelligence

RI-01 establishes the framework-neutral Intelligence domain.

It intentionally introduces no database migration and no UI replacement.

## Included

- resolution contracts;
- resolution lifecycle and transition guards;
- authority classes;
- prepared-action execution guards;
- context snapshot helpers;
- resolution factories;
- domain validation;
- compatibility mapping from legacy Assistant messages.

## Boundary

Legacy Assistant data may be adapted into this domain through
`compatibility/mapLegacyAssistantResolution.ts`.

The Intelligence domain must not import Assistant UI components or server
repositories.

## Next phase

RI-02 adds persistence for resolutions, updates, prepared actions, and
session-resolution links.
## RI-02 Persistence

RI-02 adds database-backed persistence while preserving the current Assistant
runtime.

The persistence layer is scoped through the existing `AssistantAccess`
contract, preserving workspace, user, audience, and vendor boundaries.

It supports scoped listing and reading, transactional creation, Assistant
session attachment, append-only updates, idempotent prepared actions, and
lifecycle transitions.

No UI is replaced and the legacy Assistant tables remain intact.

## RI-03/04 Context and Planning Engine

This phase introduces the permission-aware adapter Context Resolver and the
deterministic Resolution Planner.

The planner remains independent of Prisma and UI. Additional live context
sources can be connected through adapters without rewriting planning logic.

## RI-05/06 Action Registry and Resolution API

This phase introduces governed prepared actions and the first Resolution APIs.

Existing Assistant bridge actions are wrapped rather than duplicated. RCENTZ
Intelligence validates scope and authority before executing through the current
application services.

## RI-07/08 Resolution Workspace

This phase introduces the first visible Resolution-first experience. The
existing Assistant conversation is preserved as a compatibility tab while the
Resolution Bucket becomes the default operating surface.

## RI-09/10 Admin and Vendor Intelligence

This phase connects the Resolution Workspace to live operational signals from
catalogue, inventory, moderation, approvals, Store Studio, vendors, products,
promotions and submissions.

## RI-11/12 Provider Abstraction and Observability

The final MS 10 phase introduces provider-neutral routing, deterministic fallback, circuit breaking, redaction, persistent telemetry and Admin health metrics.

# MS 11 — RCENTZ Communication and Support Architecture

## Status

MS11.00 repository audit and architecture definition.

This phase installs architecture only. It does not add Prisma models, migrations, APIs, routes or UI runtime.

## Audited foundation

- `components/Navbar.tsx` renders the global customer header.
- `components/shared/CartLogics.tsx` is the current shopping Activity dropdown with Cart and Wishlist.
- `components/UserActionComponent.tsx` links to the existing Notification Centre.
- `features/notifications/` already provides persistent notifications, preferences, muting, read/archive states, deduplication and summary polling.
- `Order`, `OrderItem`, `Payment`, `Delivery` and `DeliveryTrackingEvent` already exist.
- `VendorProfile` and `VendorMembership` already provide vendor identity and role boundaries.
- `WorkspaceRole.SUPPORT` and the Admin permission system provide the first support-agent authority boundary.
- Persistent customer–vendor conversations and Support Cases do not currently exist.

## Permanent domain boundaries

```text
Communication
= customer, vendor and support conversations

Notification
= an informative event pointing to a message or operation

Activity
= cart, wishlist and shopping activity preview

Support
= governed service case, ownership, SLA, escalation and resolution
```

A Message is never stored as a Notification. Sending a Message may create a Notification for eligible recipients.

## Global Bell experience

The customer header will expose one Bell communication surface:

```text
Bell
├── Notifications
├── Inbox
└── Activity
```

- Notifications reuse the existing Notification domain.
- Inbox shows conversation previews and unread message counts.
- Activity preserves the existing Cart and Wishlist experience.
- The Bell badge represents combined unread notifications and unread conversations.
- Full destinations remain available for Notifications, Inbox, Cart and Wishlist.

## Communication domain

Planned persistent models:

- `CommunicationConversation`
- `CommunicationParticipant`
- `CommunicationContext`
- `CommunicationMessage`
- `CommunicationAttachment`
- `CommunicationStatusHistory`

Conversation types:

- `CUSTOMER_VENDOR`
- `SUPPORT_CASE`

Participant roles:

- `CUSTOMER`
- `VENDOR_MEMBER`
- `SUPPORT_AGENT`
- `ADMIN`
- `SYSTEM`

Conversation states:

```text
OPEN → ARCHIVED
OPEN → CLOSED
OPEN → RESTRICTED
ARCHIVED → OPEN
```

Messages remain auditable. Editing, deletion and moderation must retain actor and timestamp history.

## Vendor–customer communication rules

- Customers may start a conversation from a vendor shop, product or eligible order context.
- Vendors may contact a customer only when a valid marketplace relationship exists.
- Valid relationships include:
  - customer-initiated conversation;
  - vendor-owned order item;
  - assigned Support Case;
  - approved operational reason.
- Every vendor conversation is scoped to one `VendorProfile`.
- Vendor members can access only conversations belonging to their vendor.
- Vendor permissions will add:
  - `communication:view`
  - `communication:reply`
- Vendor Analysts do not receive customer-message access by default.
- Blocking, reporting, rate limiting and moderation belong in application services, not presentation components.

## Multi-vendor order boundary

An `Order` may contain products from multiple vendors while the order itself has no single vendor owner.

Therefore:

- order-linked conversations must also carry `vendorProfileId`;
- vendor context may expose only order items belonging to that vendor;
- one vendor must never receive another vendor's items, messages, notes or operational details;
- one order may have separate conversations for separate vendors.

## Attachments

Private customer evidence and message attachments must not be treated as public catalogue media.

`CommunicationAttachment` requires:

- private access rules;
- file-size limits;
- allowed MIME types;
- malware and content validation boundaries;
- uploader identity;
- audit metadata;
- controlled download authorization.

The existing public `MediaAsset` domain remains for catalogue and campaign media.

## Notification integration

The existing Notification system will be extended rather than replaced:

- add a Communication or Message notification topic;
- add message-notification preferences;
- allow notifications to target conversations or messages;
- preserve deduplication, read, archive and mute behaviour;
- keep unread message state authoritative in Communication participants, not Notification records.

## Support domain

Planned persistent models:

- `SupportCase`
- `SupportAssignment`
- `SupportNote`
- `SupportEscalation`
- `SupportStatusHistory`
- `SupportSLA`
- `SupportResolution`
- `SupportFeedback`

A Support Case references one Communication conversation.

Internal notes remain separate from customer-visible messages.

Support workflow:

```text
NEW
→ TRIAGED
→ ASSIGNED
→ IN_PROGRESS
→ WAITING_CUSTOMER | WAITING_VENDOR | WAITING_INTERNAL
→ RESOLVED
→ CUSTOMER_CONFIRMED
→ CLOSED
```

A closed case may be reopened only through a governed transition.

## Support authority

Planned Admin permissions:

- `support:view`
- `support:reply`
- `support:assign`
- `support:escalate`
- `support:resolve`
- `support:configure`
- `communication:moderate`

`WorkspaceRole.SUPPORT` begins with case viewing and replying.

Assignment, escalation policy, sensitive resolutions and configuration require progressively higher authority.

## Commerce action boundary

Support and Intelligence may prepare actions, but they must not bypass commerce authority.

Refunds, cancellations, payment changes, inventory adjustments and irreversible actions require:

```text
Prepared action
→ permission check
→ approval when required
→ application service
→ verified result
→ audit event
```

`Payment.status = REFUNDED` is not a complete refund ledger.

A governed refund operation must eventually record:

- requested amount;
- approved amount;
- reason;
- provider reference;
- requesting actor;
- approving actor;
- execution result;
- timestamps;
- audit metadata.

## Intelligence boundary

RCENTZ Intelligence may:

- summarize conversations and cases;
- identify intent and escalation risk;
- retrieve permitted order, delivery and vendor context;
- suggest response drafts;
- recommend resolution paths;
- prepare governed actions;
- record verified outcomes.

RCENTZ Intelligence may not:

- expose cross-vendor information;
- bypass conversation permissions;
- execute irreversible commerce actions without authority;
- treat generated text as a verified operational result.

## Routes

Customer:

- `/inbox`
- `/inbox/[conversationId]`
- `/support`
- `/support/[caseId]`

Vendor:

- `/vendor/inbox`
- `/vendor/inbox/[conversationId]`

Admin and support agents:

- `/admin/support`
- `/admin/support/[caseId]`
- `/admin/support/settings`

## Implementation sequence

```text
MS11.00 — Repository audit and architecture
MS11.01 — Communication contracts, Prisma and repository
MS11.02 — Bell dropdown and communication summaries
MS11.03 — Customer and Vendor Inbox
MS11.04 — Support contracts, Prisma and repository
MS11.05 — Customer Support and Agent Workspace
MS11.06 — Assignment, SLA, escalation and commerce context
MS11.07 — Admin operations and Intelligence assistance
MS11.08 — Notifications, analytics, audit and production validation
```

## Working method

```text
User explains and moderates
→ repository is inspected
→ one controlled drop is created
→ user installs and audits
→ validation runs
→ corrections are applied
→ phase is committed
```

## Validation rule

Every implementation drop must pass:

```text
Prisma generation and migration review
TypeScript
ESLint
Production build
Permission and data-isolation audit
Customer, Vendor and Admin runtime tests
Production smoke test
```

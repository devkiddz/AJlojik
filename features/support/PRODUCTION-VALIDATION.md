# MS11 Communication and Support Production Validation

## Required commands

```powershell
npx prisma format
npx prisma validate
npx prisma generate
npx prisma migrate status
npx prisma migrate deploy

npm run typecheck
npm run lint
npm run build
```

## Customer validation

- Open the Bell and verify Notifications, Inbox and Activity remain distinct.
- Start a vendor conversation and confirm only the selected vendor receives Inbox access.
- Reply from the vendor workspace and confirm the customer receives one Communication notification.
- Open a Support Case and confirm its conversation is customer-visible.
- Confirm Support status and resolution notifications respect Notification preferences.
- Confirm a customer cannot access another customer's conversation or Support Case.

## Vendor validation

- Confirm OWNER, MANAGER and EDITOR can access Vendor Inbox.
- Confirm ANALYST cannot access customer messages by default.
- Confirm a vendor sees only order items and conversations belonging to that Vendor Profile.
- Confirm one vendor cannot open another vendor's conversation URL.

## Support and Admin validation

- Confirm SUPPORT can view/reply and prepare governed commerce actions.
- Confirm MANAGER or higher authority is required to approve prepared commerce actions.
- Confirm no prepared or approved action automatically changes Payment, Order, Delivery or Inventory.
- Confirm internal notes never appear in the customer conversation.
- Confirm SLA states, escalations, assignments and Support Intelligence remain workspace-scoped.
- Confirm Intelligence drafts contain guardrails and never claim an unverified action succeeded.

## Notification validation

- Confirm COMMUNICATION can be enabled or disabled independently.
- Confirm Support messages use SUPPORT and vendor messages use COMMUNICATION.
- Confirm dedupe keys prevent repeated alerts for the same message or status event.
- Confirm muted scopes suppress routine updates while urgent Support outcomes remain governed by the existing priority policy.

## Production smoke test

- Customer: `/inbox`, `/support`, Bell dropdown.
- Vendor: `/vendor/inbox`.
- Admin: `/admin/support`, `/admin/support/operations`, `/admin/support/analytics`.
- Verify unauthenticated redirects and permission-denied API responses.
- Verify no-store headers on Communication, Support and Notification APIs.
- Verify migrations are applied before deploying the application runtime.

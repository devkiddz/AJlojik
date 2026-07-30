# Shopping List Publication Workflow

## Customer states

- **Private** — visible only in the customer’s dashboard and list workspace.
- **In review** — the owner intentionally submitted the list; it is still excluded from the Store.
- **Public** — approved by an administrator and eligible for the Store’s approved community-plan rail.
- **Rejected / Resubmit** — excluded from the Store; the owner can revise and submit again.

## Moderation rules

- Empty lists cannot be submitted.
- Only the owner can submit, withdraw, edit, archive, or change items.
- Admin approval is required before Store visibility.
- Editing an approved list automatically creates a new review request and removes it from public Store results until re-approved.
- Withdrawing or archiving a list cancels pending approval requests and restores private visibility.

## Destinations

- Dashboard: `/account`
- All customer lists: `/account/lists`
- List detail: `/account/lists/[listId]`
- Journey destinations: `/account/journey/[section]`
- Admin moderation: `/admin/approvals`
- Approved public list: `/lists/[listId]`

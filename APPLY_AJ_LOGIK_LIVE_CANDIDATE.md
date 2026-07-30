# AJ Logik Live Candidate — Discovery Hub ↔ Feed Restoration

Extract this archive directly into the AJ Logik project root and allow all listed files to overwrite their existing versions.

This is a cumulative patch. It includes the earlier Brand Studio, system-theme default, existing-product-image correction, search stabilization, generated-todo lifecycle, and AI assistant foundations.

## Discovery Hub behaviour restored

- Product selection from Search, Feed cards, Wishlist, Cart, Stories, Reels and other customer surfaces opens the product inside the global Discovery Hub.
- Search submission opens the highlighted or first matching product in the Hub. It does not navigate to a standalone product page.
- The Hub remains available from every customer route.
- `View full details in Feed` reveals the complete Product Experience in the central customer surface without changing to a standalone product route.
- On mobile, the Discovery Sheet closes during the Feed handoff.
- On desktop, the Discovery Rail stays active beside the revealed Feed experience.
- Returning from the product experience restores the previous customer workspace and experience context.

## Why this was required

The Store Feed and the global Discovery Hub currently use separate Feed Experience providers. Product intents reached the Hub, but the Hub's product-details disclosure could not render inside the central customer surface. `GlobalCustomerFeedPortal` restores that missing handoff while preserving the Hub-first interaction model.

## Validate and push

Run from the AJ Logik project root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\VALIDATE_AND_PUSH_AJ_LOGIK_LIVE_CANDIDATE.ps1
```

The script runs Prisma generation, TypeScript, ESLint and the production build before asking for an explicit `PUSH` confirmation.

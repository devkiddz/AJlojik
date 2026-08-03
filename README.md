# AJ Support Guide Foundation

This phase adds:

- governed AJ Logik knowledge;
- deterministic intent matching;
- live multivendor context from active vendor records;
- route-aware guidance;
- humanlike quick questions;
- direct navigation actions;
- seamless Guide transcript handoff into a real Support Case;
- semantic AJ Logik theme classes.

## Apply

Extract this package into the AJ Logik project root and run:

```powershell
node .\apply.support-guide-foundation.mjs
```

## Validate

```powershell
npm run typecheck
npm run lint
npm run build
```

## Runtime acceptance

1. Open Quick Support with no active case.
2. Ask “How do I buy?”
3. Ask “Is AJ Logik multivendor?”
4. Ask an unknown question and confirm the Guide asks for clarification.
5. Click a navigation action.
6. Click “Continue with a human Support agent.”
7. Confirm a Support Case opens and contains the Guide transcript.
8. Confirm existing Support case restoration and live chat still work.
9. Confirm closing the overlay does not freeze the page.

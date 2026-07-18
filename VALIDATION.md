# Validation

Validated from a clean dependency installation:

```text
npx tsc --noEmit --pretty false
PASS

npm run lint -- --max-warnings=0
PASS
```

The isolated build environment cannot fetch Google Fonts, so its production build stops at `next/font` network retrieval. This is an environment limitation rather than a TypeScript or ESLint failure. On the user's machine, the previous build reached and completed compilation before encountering stale source files.

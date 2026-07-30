# Validation

Completed in the packaging workspace:

- TypeScript/TSX syntax transpilation for every changed source file;
- local alias and relative-import resolution for every changed TypeScript file;
- package.json JSON parsing;
- CSS delimiter balance;
- no environment files or credentials included;
- no Prisma schema or migration changes;
- no legacy Discovery Hub implementation restored.

A dependency-aware Next.js TypeScript check, ESLint run and production build must be run in the user's Node 24 project environment because dependencies are not present in the packaging workspace.

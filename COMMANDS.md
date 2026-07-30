# Commands

## 1. Copy order

Copy every file under `CREATE/`.

Replace every file under `REPLACE/`.

## 2. Environment

For immediate Early Access testing, no variable is required because the default mode is `beta`.

Optional Vercel setting:

```text
NEXT_PUBLIC_PWA_INSTALL_MODE=beta
```

Later public release:

```text
NEXT_PUBLIC_PWA_INSTALL_MODE=public
```

Hide AJ Logik’s install UI:

```text
NEXT_PUBLIC_PWA_INSTALL_MODE=off
```

After changing a `NEXT_PUBLIC_` variable, redeploy because it is embedded during the build.

## 3. Validate

```powershell
npm run typecheck
npm run lint
npm run build
```

## 4. Local production test

```powershell
npm run build
npm run start
```

Open the production build in a supported browser. Service workers remain unregistered during `npm run dev`.

## 5. Commit

```powershell
git add features/pwa app/layout.tsx components/Navbar.tsx app/manifest.ts public/sw.js next.config.ts app/offline/page.tsx

git commit -m "feat: complete controlled PWA and installed app experience"

git push origin main
```

No migration or seed command is required.

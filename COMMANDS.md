# Copy and Validation Commands

## Copy order

Replace the files in this order:

1. `features/pwa/PWAInstallControl.tsx`
2. `features/pwa/pwa.css`
3. `features/experience-stack/ExperienceNavigationControls.tsx`
4. `features/experience-stack/CustomerExperienceNavigationPortal.tsx`
5. `components/shared/LogoComponent.tsx`
6. `components/shared/SidebarToggle.tsx`
7. `components/UserActionComponent.tsx`
8. `components/Navbar.tsx`
9. `components/layout/ApplicationShell.tsx`

## Validate

```powershell
npm run typecheck
npm run lint
npm run build
```

## Commit

```powershell
git add components/Navbar.tsx components/UserActionComponent.tsx components/shared/LogoComponent.tsx components/shared/SidebarToggle.tsx components/layout/ApplicationShell.tsx features/experience-stack/ExperienceNavigationControls.tsx features/experience-stack/CustomerExperienceNavigationPortal.tsx features/pwa/PWAInstallControl.tsx features/pwa/pwa.css

git commit -m "feat: introduce premium command header and mobile navigation hierarchy"

git push origin main
```

No migration or seed command is required.

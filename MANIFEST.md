# ms-e02.4e — Account Sheet Offset, Floating Back & WordMark-Only Identity

Apply after `ms-e02.4d`.

## Replace

1. `components/shared/LogoComponent.tsx`
2. `components/UserActionComponent.tsx`
3. `features/experience-stack/ExperienceNavigationControls.tsx`
4. `components/layout/ApplicationShell.tsx`

## Corrections

### Account Sheet

- The entire Sheet now begins below the complete Navbar.
- The offset includes the installed-app top safe area.
- The close button moves down with the Sheet because it remains positioned relative to the Sheet.
- The Sheet height is recalculated from the remaining viewport.
- The Sheet still reaches the bottom and retains bottom safe-area handling.

### Back control

- The Back slot is now absolutely positioned over the top-left Hero region.
- It no longer reserves vertical space or pushes the Hero downward.
- The slot ignores pointer events while the actual Back button remains clickable.
- It still uses Experience Stack navigation rather than browser history.

### Brand identity

- The app icon is removed completely from the Navbar.
- Only the AJ Logik WordMark remains.
- No replacement generic symbol is introduced.

## Preserved

- Start Fresh
- Clear History
- Experience History
- Search
- Activity
- Cart and Wishlist
- Discovery Hub controls
- PWA Install, Share and Update behaviour

No migration or seed is required.

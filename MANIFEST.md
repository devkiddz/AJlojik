# ms-e02.4g — Mobile Media Viewer & Experience Back Polish

Apply after `ms-e02.4f`.

## Replace

1. `features/commerce-stories/components/CommerceStoryViewer.tsx`
2. `features/store-studio/components/StoreReelViewer.tsx`
3. `features/experience-stack/ExperienceNavigationControls.tsx`

## Commerce Story Player

- Starts below the complete mobile Navbar and PWA safe area.
- Uses the exact remaining viewport height.
- Remains full-width on phones.
- Keeps the original centered premium player on larger screens.
- Adds a restrained rounded top edge and upper shadow.
- Disables the duplicate generic Dialog close control because the Story Player already has its own close button.
- Does not alter Story timing, progress, media handling or actions.

## Store Reels Player

- Starts below the complete mobile Navbar and PWA safe area.
- Restores an explicit full viewport width on phones.
- Uses the exact remaining viewport height.
- Replaces the fixed `58dvh` media row with a stable 62/38 container proportion.
- Prevents the commerce/details panel from being squeezed by a viewport-relative media row.
- Preserves the original large desktop two-column Reel experience.
- Does not alter Reel playback, navigation or commerce actions.

## Experience Back

- Moves slightly lower above the Hero area.
- Remains absolutely overlaid and does not consume page layout space.
- Gains stronger blur, saturation, inner highlight and depth.
- Remains connected to the Experience Stack rather than browser history.

## Database

No migration or seed is required.

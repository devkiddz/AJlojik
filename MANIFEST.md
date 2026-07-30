# ms-e02.4h — Immersive Player Top-Level Hotfix

Apply after `ms-e02.4g`.

## Replace

1. `features/commerce-stories/components/CommerceStoryViewer.tsx`
2. `features/store-studio/components/StoreReelViewer.tsx`

## Corrected interpretation

The Story and Reels players now use the same mobile top level as the Account Sheet:

- top begins at the device safe-area inset;
- the players overlay the customer Navbar instead of starting below it;
- Dialog z-index remains above the Navbar;
- the player occupies the full remaining phone viewport to the bottom;
- mobile corners return to a true immersive fullscreen presentation;
- desktop centered modal sizing remains unchanged.

## Preserved

- Story playback, progress, actions and navigation;
- Reel playback, 62/38 mobile layout and commerce panel;
- close buttons;
- desktop player presentation;
- Navbar and Account Sheet implementation.

No migration or seed is required.

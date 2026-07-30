# Test Checklist

## Mobile Navbar

- [ ] Header covers the entire screen width.
- [ ] No feed content leaks through the top or side edges.
- [ ] Installed iPhone safe-area is filled by the header surface.
- [ ] Only the app logo is visible; AJ Logik words are absent.
- [ ] Navigation toggle remains operational.
- [ ] Search/categories toggle remains operational.
- [ ] Activity dropdown remains operational.
- [ ] Account Sheet remains operational.
- [ ] History is absent from the mobile Navbar.
- [ ] Share/Install/Update is absent from the mobile Navbar.
- [ ] No control overlaps at 320px, 360px, 390px or 430px widths.

## Account Sheet

- [ ] Experience History appears on mobile/tablet.
- [ ] History shows the real count.
- [ ] History expands inline without escaping the Sheet.
- [ ] Previous experience works.
- [ ] Direct history entry navigation works.
- [ ] Start Fresh works.
- [ ] Clear History works.
- [ ] Account Sheet closes after history navigation.
- [ ] Installed PWA shows Share inside the Sheet.
- [ ] Browser installation shows Install App/Beta inside the Sheet.
- [ ] Waiting service worker shows Update inside the Sheet.
- [ ] Desktop Account Sheet does not duplicate desktop History.

## Traditional Back

- [ ] Back appears below the Navbar when `canGoBack` is true.
- [ ] Back aligns with the normal page gutter.
- [ ] Back appears before Hero/page content.
- [ ] Back does not overlap the Hero.
- [ ] Back uses Experience Stack state.
- [ ] Back disappears when no meaningful previous experience exists.
- [ ] Back is not shown on desktop.

## Desktop Header

- [ ] Header reads as one premium command surface.
- [ ] App logo replaces the AJ Logik words.
- [ ] Category controls remain operational.
- [ ] AJ Store control remains operational.
- [ ] Search remains operational.
- [ ] Install/Update/Share remains operational.
- [ ] Activity remains operational.
- [ ] History remains operational.
- [ ] Account profile remains operational.
- [ ] Header does not collide with left or right rails.
- [ ] Header remains stable while scrolling.

## Regression

- [ ] Discovery Hub Control is unchanged.
- [ ] Search engine and mobile Search overlay are unchanged.
- [ ] Cart and Wishlist providers are unchanged.
- [ ] Experience History persistence is unchanged.
- [ ] Store category query behaviour is unchanged.
- [ ] PWA installation runtime is unchanged.
- [ ] Bottom navigation is unchanged.
- [ ] Admin and Vendor shells are unchanged.

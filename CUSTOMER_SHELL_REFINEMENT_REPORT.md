# AJ Logik Customer Shell Refinement Report

## Discovery Hub

The collapsed desktop Hub is now an icon rail rather than a second text-heavy panel. Its expansion control is a compact Compass/Panel icon, and its resolved shortcuts are icon buttons with accessible labels and native tooltips.

The expanded Hub no longer owns Back/History controls. Those controls are portalled into the persistent global navbar while remaining inside the single Experience Stack provider.

## Intelligent navigation

Back appears only when the Experience Stack has a meaningful previous entry. The History navigator is available on wide navigation layouts and restores stored experience entries directly.

The Discovery surface is no longer keyed by pathname, so its Experience Stack is not remounted on every customer route change. It only remounts when the responsive presentation switches between desktop and mobile.

## Sticky navbar

Sticky ownership now belongs to ApplicationShell. The nested Navbar root is a normal visual container, avoiding nested header/sticky ownership. The sidebar inset uses overflow clipping rather than a scrolling overflow ancestor that could constrain sticky behavior.

## User Action Tray

The tray uses a full dynamic viewport height. Header, account information, actions and theme settings scroll inside one constrained body. Sign in, Create account or Sign out stays in a fixed footer with safe-area padding.

## Fluid application scale

The root visual scale now uses bounded fluid sizing rather than transform scaling. Existing rem-based Tailwind utilities inherit a controlled root font scale. Shared custom properties define navbar height, page gutters, section spacing, control height, card radius and panel width. Short desktop screens receive a denser vertical mode.

## Store Banner

The carousel now selects slides by stable IDs rather than mutable array indexes. Media failures are tracked per URL, so a failed mobile image does not automatically disable the desktop source. Adjacent images are preloaded, slide duration has a safe minimum, media transitions fade in, and mobile video sources are supported through responsive source selection.

## Deferred

Admin layout spacing, control-panel typography and the distance between Admin content and its left navigation remain intentionally deferred to the dedicated Admin UI sequence.

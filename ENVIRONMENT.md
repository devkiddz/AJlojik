# PWA Environment Control

## Early Access / Beta

```text
NEXT_PUBLIC_PWA_INSTALL_MODE=beta
```

Shows:

```text
Install Beta
```

## Public release

```text
NEXT_PUBLIC_PWA_INSTALL_MODE=public
```

Shows:

```text
Install App
```

## Hide install UI

```text
NEXT_PUBLIC_PWA_INSTALL_MODE=off
```

The production service worker still registers so the application foundation, update handling and offline fallback continue working. This setting controls AJ Logik’s own install invitation, not every browser-owned menu option.

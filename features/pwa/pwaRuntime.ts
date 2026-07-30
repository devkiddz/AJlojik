import type {
  PWAInstallMode,
  PWAPlatform
} from './pwaTypes';

const INSTALL_MODES =
  new Set<PWAInstallMode>([
    'off',
    'beta',
    'public'
  ]);

export function resolvePWAInstallMode(
  value:
    | string
    | undefined
): PWAInstallMode {
  const normalized =
    value
      ?.trim()
      .toLowerCase() as
      | PWAInstallMode
      | undefined;

  if (
    normalized &&
    INSTALL_MODES.has(
      normalized
    )
  ) {
    return normalized;
  }

  return 'beta';
}

export function resolvePWAPlatform(
  userAgent:
    string
): PWAPlatform {
  const normalized =
    userAgent.toLowerCase();

  if (
    /iphone|ipad|ipod/.test(
      normalized
    )
  ) {
    return 'ios';
  }

  if (
    /android/.test(
      normalized
    )
  ) {
    return 'android';
  }

  if (
    /windows|macintosh|linux|cros/.test(
      normalized
    )
  ) {
    return 'desktop';
  }

  return 'unknown';
}

export function resolveStandaloneMode(): boolean {
  if (
    typeof window ===
    'undefined'
  ) {
    return false;
  }

  const navigatorWithStandalone =
    window.navigator as
      Navigator & {
        standalone?:
          boolean;
      };

  return (
    window.matchMedia(
      '(display-mode: standalone)'
    ).matches ||
    navigatorWithStandalone.standalone ===
      true
  );
}

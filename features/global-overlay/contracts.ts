import type {
  ReactNode
} from 'react';

// ============================================================
// IMPERATIVE GLOBAL WORKSPACE OVERLAYS
// ============================================================

export type GlobalOverlayVariant =
  | 'dialog'
  | 'workspace'
  | 'panel'
  | 'sheet'
  | 'fullscreen';

export type GlobalOverlayManagerSize =
  | 'sm'
  | 'md'
  | 'lg'
  | 'xl';

export type GlobalOverlaySize =
  GlobalOverlayManagerSize;

export type GlobalOverlayConfig = {
  id?: string;

  eyebrow?: ReactNode;

  title: ReactNode;

  description?: ReactNode;

  content: ReactNode;

  footer?: ReactNode;

  variant?: GlobalOverlayVariant;

  size?: GlobalOverlayManagerSize;

  closeLabel?: string;

  dismissible?: boolean;
};

export type GlobalOverlayEntry =
  GlobalOverlayConfig & {
    id: string;
  };

// ============================================================
// DECLARATIVE DIALOG CANVAS
// ============================================================

export type GlobalOverlayPresentation =
  | 'adaptive'
  | 'centered'
  | 'fullscreen';

export type GlobalDialogSize =
  | 'compact'
  | 'standard'
  | 'wide'
  | 'gallery'
  | 'workspace';

export type GlobalOverlayPadding =
  | 'none'
  | 'compact'
  | 'comfortable';

export type GlobalOverlayScrollMode =
  | 'body'
  | 'canvas'
  | 'none';

export type GlobalOverlayChrome =
  | 'standard'
  | 'minimal'
  | 'none';

export type GlobalOverlayRegistration = {
  id: string;

  label: string;
};

export type GlobalDialogProps = {
  id?: string;

  open: boolean;

  onOpenChange: (
    open: boolean
  ) => void;

  title: ReactNode;

  description?: ReactNode;

  eyebrow?: ReactNode;

  children: ReactNode;

  footer?: ReactNode;

  presentation?: GlobalOverlayPresentation;

  size?: GlobalDialogSize;

  padding?: GlobalOverlayPadding;

  scrollMode?: GlobalOverlayScrollMode;

  chrome?: GlobalOverlayChrome;

  closeLabel?: string;

  showCloseButton?: boolean;

  dismissible?: boolean;

  className?: string;

  bodyClassName?: string;

  headerClassName?: string;

  footerClassName?: string;
};

// ============================================================
// COMBINED GLOBAL AUTHORITY
// ============================================================

export type GlobalOverlayContextValue = {
  stack:
    readonly GlobalOverlayEntry[];

  activeOverlay:
    GlobalOverlayEntry |
    null;

  openOverlay: (
    config:
      GlobalOverlayConfig
  ) => string;

  replaceOverlay: (
    config:
      GlobalOverlayConfig
  ) => string;

  closeOverlay: (
    id?: string
  ) => void;

  backOverlay:
    () => void;

  closeAllOverlays:
    () => void;

  registeredDialogs:
    readonly GlobalOverlayRegistration[];

  topOverlayId:
    string |
    null;

  registerOverlay: (
    registration:
      GlobalOverlayRegistration
  ) => void;

  unregisterOverlay: (
    overlayId:
      string
  ) => void;

  bringOverlayToFront: (
    overlayId:
      string
  ) => void;

  getOverlayLayer: (
    overlayId:
      string
  ) => number;

  isTopOverlay: (
    overlayId:
      string
  ) => boolean;

  hasOpenOverlay:
    boolean;
};

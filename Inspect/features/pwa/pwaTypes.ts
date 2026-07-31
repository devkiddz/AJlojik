export type PWAInstallMode =
  | 'off'
  | 'beta'
  | 'public';

export type PWAPlatform =
  | 'ios'
  | 'android'
  | 'desktop'
  | 'unknown';

export type PWAInstallOutcome =
  | 'accepted'
  | 'dismissed'
  | 'guide-opened'
  | 'installed'
  | 'unavailable';

export type PWAShareOutcome =
  | 'shared'
  | 'copied'
  | 'dismissed'
  | 'unsupported';

export type BeforeInstallPromptChoice = {
  outcome:
    | 'accepted'
    | 'dismissed';

  platform:
    string;
};

export interface BeforeInstallPromptEvent
  extends Event {
  readonly platforms:
    string[];

  readonly userChoice:
    Promise<BeforeInstallPromptChoice>;

  prompt:
    () =>
      Promise<BeforeInstallPromptChoice>;
}

export type PWARuntimeValue = {
  installMode:
    PWAInstallMode;

  platform:
    PWAPlatform;

  isOnline:
    boolean;

  isStandalone:
    boolean;

  installAvailable:
    boolean;

  updateReady:
    boolean;

  updateNoticeVisible:
    boolean;

  installGuideOpen:
    boolean;

  announcement:
    string | null;

  install:
    () =>
      Promise<PWAInstallOutcome>;

  shareCurrentExperience:
    () =>
      Promise<PWAShareOutcome>;

  applyUpdate:
    () =>
      Promise<void>;

  dismissUpdateNotice:
    () =>
      void;

  openInstallGuide:
    () =>
      void;

  closeInstallGuide:
    () =>
      void;
};

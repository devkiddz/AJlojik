export type WorkspaceMode =
  | 'LIVE'
  | 'DEMO'
  | 'PRACTICE'
  | 'SANDBOX';

export type WorkspaceRole =
  | 'MEMBER'
  | 'PREMIUM_MEMBER'
  | 'SUPPORT'
  | 'MODERATOR'
  | 'MANAGER'
  | 'ADMIN'
  | 'OWNER'
  | 'SUPER_ADMIN';

export type WorkspaceWallet = {
  currency: string;
  balance: number;
};

export type WorkspaceMembership = {
  role: WorkspaceRole;
  active: boolean;
};

export type Workspace = {
  id: string;
  slug: string;
  name: string;

  mode: WorkspaceMode;

  active: boolean;
  resettable: boolean;

  membership: WorkspaceMembership;

  wallet: WorkspaceWallet | null;
};

export type WorkspaceRuntime = {
  activeWorkspace: Workspace | null;

  availableWorkspaces: Workspace[];

  isLive: boolean;
  isDemo: boolean;
  isPractice: boolean;
  isSandbox: boolean;

  switchingWorkspace: boolean;

  error: string | null;
};
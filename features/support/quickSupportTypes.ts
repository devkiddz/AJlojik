import type {
  SupportCaseStatusValue,
  SupportIdentity
} from './supportTypes';

export type QuickSupportReplyPreview = {
  caseId: string;
  caseNumber: string;
  messageId: string;
  bodyPreview: string;
  sender: SupportIdentity | null;
  createdAt: string;
};

export type QuickSupportCaseContinuity = {
  id: string;
  caseNumber: string;
  subject: string;
  status: SupportCaseStatusValue;
  unreadCount: number;
  lastReadAt: string | null;
  lastMessageAt: string | null;
  updatedAt: string;
};

export type QuickSupportSummary = {
  workspaceId: string;
  generatedAt: string;
  totalCaseCount: number;
  openCaseCount: number;
  unreadCount: number;
  activeCase:
    QuickSupportCaseContinuity |
    null;
  latestAgentReply:
    QuickSupportReplyPreview |
    null;
};

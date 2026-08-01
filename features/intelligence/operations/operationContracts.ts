import type {
  IntelligenceResolutionType
} from '../domain';

export type IntelligenceOperationTone =
  | 'neutral'
  | 'attention'
  | 'critical'
  | 'positive';

export type IntelligenceOperationSignal = {
  id: string;
  title: string;
  description: string;
  count: number;
  href: string;
  tone: IntelligenceOperationTone;
  resolutionType:
    IntelligenceResolutionType;
  resolutionTitle: string;
  resolutionObjective: string;
  expectedOutcome: string;
};

export type IntelligenceOperationsSnapshot = {
  audience:
    | 'admin'
    | 'vendor';
  capturedAt: string;
  headline: string;
  summary: string;
  signals:
    IntelligenceOperationSignal[];
};

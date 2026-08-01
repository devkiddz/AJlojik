import type {
  IntelligenceAudience,
  IntelligenceContextSnapshot,
  IntelligenceResolutionType
} from '../domain';

export type IntelligenceContextSection =
  | 'identity'
  | 'experience'
  | 'commerce'
  | 'behaviour'
  | 'operations';

export type IntelligenceContextRequest = {
  audience: IntelligenceAudience;
  workspaceId: string;
  userId: string;
  vendorProfileId?: string | null;
  permissions: ReadonlySet<string>;
  resolutionType?: IntelligenceResolutionType;
  runtime?: {
    route?: string | null;
    productId?: string | null;
    category?: string | null;
    collectionId?: string | null;
    campaignId?: string | null;
    intent?: string | null;
    mode?: string | null;
    experienceEntryId?: string | null;
  };
};

export type IntelligenceContextAdapterResult = {
  section: IntelligenceContextSection;
  data: Record<string, unknown>;
  references?: Partial<
    IntelligenceContextSnapshot['references']
  >;
  warnings?: string[];
};

export type IntelligenceContextAdapter = {
  id: string;
  section: IntelligenceContextSection;
  supports(
    request: IntelligenceContextRequest
  ): boolean;
  resolve(
    request: IntelligenceContextRequest
  ): Promise<IntelligenceContextAdapterResult>;
};

export type IntelligenceContextResolution = {
  snapshot: IntelligenceContextSnapshot;
  warnings: string[];
  adapters: string[];
};

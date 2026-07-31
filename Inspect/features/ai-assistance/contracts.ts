export type AIAssistantAudience = 'admin' | 'vendor' | 'customer';

export type AIAssistantCapability = {
  id: string;
  title: string;
  description: string;
  examples: string[];
};

export type AIAssistantProfile = {
  audience: AIAssistantAudience;
  eyebrow: string;
  title: string;
  description: string;
  contextDescription: string;
  capabilities: AIAssistantCapability[];
  authorityRules: string[];
  preparationSteps: string[];
};

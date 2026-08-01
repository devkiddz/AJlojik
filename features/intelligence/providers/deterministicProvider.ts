import type { IntelligenceProvider } from './providerContracts';

export const deterministicIntelligenceProvider: IntelligenceProvider = {
  key: 'rcentz-deterministic',
  kind: 'DETERMINISTIC',
  supports: () => true,
  async execute(request) {
    return {
      model: 'rcentz-rules-v1',
      output: {
        operation: request.operation,
        promptVersion: request.promptVersion,
        result: request.input,
        deterministic: true
      }
    };
  }
};

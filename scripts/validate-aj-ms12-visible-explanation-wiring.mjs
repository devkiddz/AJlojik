import {
  readFileSync
} from 'node:fs';

const experience =
  readFileSync(
    'features/ai-assistance/components/GuidedAssistantExperience.tsx',
    'utf8'
  );

const responseCard =
  readFileSync(
    'features/ai-assistance/components/AssistantResponseCard.tsx',
    'utf8'
  );

const engine =
  readFileSync(
    'features/ai-assistance/server/localAssistantEngine.ts',
    'utf8'
  );

function assert(condition, message) {
  if (!condition) {
    console.error(
      `[AJ Visible Explanation Wiring] Validation failed: ${message}`
    );
    process.exit(1);
  }
}

assert(
  experience.includes('AJ_MS12_VISIBLE_EXPLANATION_WIRING_V4'),
  'wiring marker is missing'
);

assert(
  experience.includes('latestVisiblePlanExplanation'),
  'latest explanation resolver is missing'
);

assert(
  experience.includes('latestPlanExplanationMessage'),
  'latest explanation state is missing'
);

assert(
  experience.includes('displayedResponseMessage'),
  'display message authority is missing'
);

assert(
  /message\s*=\s*\{\s*displayedResponseMessage\s*\?\?\s*activeSuggestion\.message\s*\}/s.test(
    experience
  ),
  'AssistantResponseCard is still wired only to the saved plan snapshot'
);

assert(
  experience.includes('AJ explained the active Plan v'),
  'non-versioning explanation status is missing'
);

assert(
  responseCard.includes('AJ_MS12_VISIBLE_PLAN_EXPLANATION_V3'),
  'visible explanation panel is missing'
);

const explanationStart =
  engine.indexOf(
    'function activePlanExplanationResponse('
  );

const explanationEnd =
  engine.indexOf(
    '\nasync function ',
    explanationStart
  );

const explanationBlock =
  engine.slice(
    explanationStart,
    explanationEnd > explanationStart
      ? explanationEnd
      : undefined
  );

assert(
  /actions\s*:\s*\[\]/s.test(
    explanationBlock
  ),
  'explanation response still exposes copied commerce actions'
);

console.log('[AJ Visible Explanation Wiring] Validation passed.');

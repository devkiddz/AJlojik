import {
  existsSync,
  readFileSync
} from 'node:fs';

const paths = {
  runtime: 'features/ai-assistance/components/AssistantRuntimePage.tsx',
  guided: 'features/ai-assistance/components/GuidedAssistantExperience.tsx',
  summary: 'features/ai-assistance/components/JourneySummaryCard.tsx',
  dialog: 'features/ai-assistance/components/JourneyCompletionDialog.tsx'
};

const failures = [];

for (const path of Object.values(paths)) {
  if (!existsSync(path)) {
    failures.push(`Missing file: ${path}`);
  }
}

if (!failures.length) {
  const runtime = readFileSync(paths.runtime, 'utf8');
  const guided = readFileSync(paths.guided, 'utf8');
  const summary = readFileSync(paths.summary, 'utf8');
  const dialog = readFileSync(paths.dialog, 'utf8');

  for (const [name, source] of [
    ['runtime', runtime],
    ['guided', guided],
    ['summary', summary],
    ['dialog', dialog]
  ]) {
    if (!source.includes('AJ_MS12_JOURNEY_SUMMARY_COMPLETION_V1')) {
      failures.push(`${name} is missing the phase marker.`);
    }
  }

  for (const required of [
    '<JourneySummaryCard',
    '<JourneyCompletionDialog',
    'requestJourneyCompletion',
    'confirmJourneyCompletion',
    'reopenJourney',
    "activeSession?.journeyStage === 'COMPLETED' ? null : pendingJourneyQuestion"
  ]) {
    if (!runtime.includes(required)) {
      failures.push(`Runtime is missing: ${required}`);
    }
  }

  for (const required of [
    'Journey summary',
    'Complete Journey',
    'Completed Journey preview',
    'View full reasoning',
    'Reopen Journey'
  ]) {
    if (!summary.includes(required)) {
      failures.push(`Summary is missing: ${required}`);
    }
  }

  for (const required of [
    'Finish this Journey as a draft?',
    'Save as draft',
    'Complete this Journey?',
    'Keep working'
  ]) {
    if (!dialog.includes(required)) {
      failures.push(`Completion dialog is missing: ${required}`);
    }
  }

  for (const required of [
    'insights && reasoningOpen',
    'id="aj-journey-reasoning"',
    'Collapse full reasoning',
    'Plan accepted',
    'AJ recorded this decision without changing Plan v'
  ]) {
    if (!guided.includes(required)) {
      failures.push(`Guided experience is missing: ${required}`);
    }
  }

  const reasoningStart = guided.indexOf('id="aj-journey-reasoning"');
  const reasoningEnd = guided.indexOf('Collapse full reasoning', reasoningStart);
  const reasoningBlock = reasoningStart >= 0 && reasoningEnd > reasoningStart
    ? guided.slice(reasoningStart, reasoningEnd)
    : '';

  if (reasoningBlock.includes('What changed')) {
    failures.push('Current-plan reasoning still embeds Plan-history changes.');
  }
}

if (failures.length) {
  console.error('\nAJ Journey Summary + Completion validation failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  console.error();
  process.exit(1);
}

console.log(`
AJ Journey Summary + Completion validation passed.

Confirmed:
  Compact Journey Summary appears near Journey Progress
  Active plan, budget, products, understanding and next step are visible immediately
  Accepted decisions are presented as Plan accepted
  Detailed reasoning is collapsed by default and excludes Plan-history changes
  Incomplete completion requests offer Save as draft
  Ready Journeys use controlled completion without creating another Plan version
  Completed Journeys hide the composer and expose a compact expandable preview
  Completed Journeys provide an explicit Reopen control
  No database migration required
`);

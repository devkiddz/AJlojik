import {
  readFileSync
} from 'node:fs';

const path =
  'features/ai-assistance/components/AssistantResponseCard.tsx';

const source =
  readFileSync(
    path,
    'utf8'
  );

function assert(condition, message) {
  if (!condition) {
    console.error(
      `[AJ Visible Plan Explanation] Validation failed: ${message}`
    );
    process.exit(1);
  }
}

const visibleMarker =
  source.indexOf(
    'AJ_MS12_VISIBLE_PLAN_EXPLANATION_V3'
  );

const productMarker =
  source.indexOf(
    'AJ_MS12_PRODUCT_LIBRARY_PRESENTATION_V1'
  );

assert(
  visibleMarker >= 0,
  'Visible explanation marker is missing.'
);

assert(
  productMarker > visibleMarker,
  'The explanation panel is not positioned before the Product Library.'
);

assert(
  source.includes('const isPlanExplanation'),
  'Explanation result classifier is missing.'
);

assert(
  source.includes('visibleExplanationSections'),
  'Visible explanation section authority is missing.'
);

assert(
  source.includes('remainingSections'),
  'General section de-duplication is missing.'
);

assert(
  source.includes('Plan explanation'),
  'Visible explanation heading is missing.'
);

assert(
  source.includes('Open a product below when you need its individual description'),
  'Product Library direction is missing.'
);

assert(
  source.includes('remainingSections.length'),
  'The general sections visibility is not governed by remainingSections.'
);

assert(
  source.includes('remainingSections.map'),
  'The general sections mapper is not governed by remainingSections.'
);

console.log('[AJ Visible Plan Explanation] Validation passed.');

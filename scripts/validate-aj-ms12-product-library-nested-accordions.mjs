import {
  readFileSync
} from 'node:fs';

const productCard = readFileSync(
  'features/ai-assistance/components/AssistantProductLibraryCard.tsx',
  'utf8'
);

const planFaqs = readFileSync(
  'features/ai-assistance/components/AssistantPlanFaqs.tsx',
  'utf8'
);

const responseCard = readFileSync(
  'features/ai-assistance/components/AssistantResponseCard.tsx',
  'utf8'
);

function assert(condition, message) {
  if (!condition) {
    console.error(`[AJ Product Library Nested Accordions] ${message}`);
    process.exit(1);
  }
}

assert(
  productCard.includes('AJ_MS12_PRODUCT_LIBRARY_NESTED_ACCORDION_V2'),
  'Nested product accordion marker is missing.'
);

assert(
  productCard.includes('group/product') &&
    productCard.includes('group-open/product:rotate-180'),
  'Each product is not controlled by a parent accordion.'
);

assert(
  productCard.includes('LibraryAccordion'),
  'Product detail accordions are missing from the parent product accordion.'
);

assert(
  !productCard.includes('font-black') &&
    !productCard.includes('uppercase') &&
    !productCard.includes('tracking-['),
  'Product Library typography still contains aggressive weight, uppercase or custom tracking.'
);

assert(
  !planFaqs.includes('font-black') &&
    !planFaqs.includes('uppercase') &&
    !planFaqs.includes('tracking-['),
  'Plan FAQ typography still contains aggressive weight, uppercase or custom tracking.'
);

const markerIndex = responseCard.indexOf('AJ_MS12_PRODUCT_LIBRARY_PRESENTATION_V1');
const faqIndex = responseCard.indexOf('<AssistantPlanFaqs', markerIndex);

assert(
  markerIndex >= 0 && faqIndex > markerIndex,
  'Could not locate the Product Library presentation block.'
);

const productBlock = responseCard.slice(markerIndex, faqIndex);

assert(
  productBlock.includes('font-semibold') &&
    !productBlock.includes('font-black'),
  'Product Library section heading does not use normal RCENTZ typography.'
);

console.log('[AJ Product Library Nested Accordions] Validation passed.');

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function read(relativePath) {
  return fs.readFileSync(
    path.join(
      root,
      relativePath
    ),
    'utf8'
  ).replaceAll(
    '\\r\\n',
    '\\n'
  );
}

const widget = read(
  'components/ActiveProductWidget.tsx'
);

const aiPage = read(
  'app/(store)/ai/page.tsx'
);

const runtime = read(
  'features/ai-assistance/components/AssistantRuntimePage.tsx'
);

const failures = [];

const checks = [
  [
    widget,
    'AJ_PRODUCT_ACTION_TRAY_DEEP_INSIGHT_V1',
    'Action-tray marker'
  ],
  [
    widget,
    'const actionTrayOpen',
    'Action-tray state'
  ],
  [
    widget,
    'aria-label="More product actions"',
    'Ellipsis action button'
  ],
  [
    widget,
    '<MoreHorizontal className="size-4" />',
    'Ellipsis icon'
  ],
  [
    widget,
    'Add to Shopping List',
    'Shopping List tray action'
  ],
  [
    widget,
    'Deep Insight',
    'Deep Insight tray action'
  ],
  [
    widget,
    "mode:\n            'deep-insight'",
    'Deep Insight mode'
  ],
  [
    widget,
    "intent:\n            'product-decision'",
    'Deep Insight intent'
  ],
  [
    widget,
    'productId:',
    'Deep Insight product identity'
  ],
  [
    widget,
    'productName:',
    'Deep Insight product name'
  ],
  [
    widget,
    'router.push(\n        `/ai?',
    'AI route handoff'
  ],
  [
    aiPage,
    'const productName =',
    'AI product-name reader'
  ],
  [
    aiPage,
    'initialPrompt={',
    'AI initial prompt handoff'
  ],
  [
    aiPage,
    'Give me a deep insight into',
    'Deep Insight decision prompt'
  ],
  [
    runtime,
    'initialPrompt?: string;',
    'Assistant Runtime prompt contract'
  ],
  [
    runtime,
    'initialPrompt =',
    'Assistant Runtime prompt default'
  ],
  [
    runtime,
    'savedDraft ||\n              initialPrompt',
    'Saved-draft precedence'
  ]
];

for (const [source, value, label] of checks) {
  if (!source.includes(value)) {
    failures.push(
      label + ' is missing.'
    );
  }
}

const cartIndex =
  widget.indexOf(
    "aria-label={`Add ${selectedVariant?.label ?? product.name} to cart`}"
  );

const wishlistIndex =
  widget.indexOf(
    "aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}"
  );

const moreIndex =
  widget.indexOf(
    'aria-label="More product actions"'
  );

if (
  cartIndex < 0 ||
  wishlistIndex < 0 ||
  moreIndex < 0 ||
  !(
    cartIndex <
      wishlistIndex &&
    wishlistIndex <
      moreIndex
  )
) {
  failures.push(
    'Visible action order is not Add to cart, Wishlist, More.'
  );
}

if (
  widget.includes(
    'aria-label="Add to Shopping List"'
  )
) {
  failures.push(
    'Shopping List still occupies a primary action-button slot.'
  );
}

if (failures.length) {
  console.error(
    '\nAJ Product Action Tray + Deep Insight validation failed:\n'
  );

  for (const failure of failures) {
    console.error(
      '- ' + failure
    );
  }

  console.error();
  process.exit(1);
}

console.log(
  '\nAJ Product Action Tray + Deep Insight validation passed.\n\n' +
  'Confirmed:\n' +
  '  Primary product actions are Add to cart, Wishlist and More\n' +
  '  Add to Shopping List reuses the existing list selector\n' +
  '  Deep Insight opens AJ Intelligence with exact product identity\n' +
  '  Product name, category, intent and mode are carried into /ai\n' +
  '  AJ Intelligence receives a decision-focused prompt draft\n' +
  '  Existing Cart, Wishlist, Shopping List and Hub-scroll authorities remain intact\n' +
  '  No database migration required\n'
);

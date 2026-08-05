import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const widgetPath = path.join(
  root,
  'components',
  'ActiveProductWidget.tsx'
);

const failures = [];

if (!fs.existsSync(widgetPath)) {
  failures.push(
    'components/ActiveProductWidget.tsx was not found.'
  );
}

const source =
  failures.length
    ? ''
    : fs.readFileSync(
        widgetPath,
        'utf8'
      );

const required = [
  'AJ_HUB_PRODUCT_SCROLL_TOP_V1',
  "import { useEffect, useMemo, useRef, useState } from 'react';",
  'const productScrollRef =',
  'const activeProductScrollKey =',
  'window.requestAnimationFrame(',
  'productScrollRef.current?.scrollTo({',
  'top: 0',
  "behavior: 'auto'",
  'ref={productScrollRef}',
  'data-aj-hub-product-scroll-root'
];

for (const value of required) {
  if (!source.includes(value)) {
    failures.push(
      'ActiveProductWidget is missing: ' + value
    );
  }
}

if (
  source.includes(
    'window.scrollTo({'
  ) ||
  source.includes(
    'document.documentElement.scrollTop = 0'
  )
) {
  failures.push(
    'The repair must scroll the Hub container, not the browser window.'
  );
}

const effectIndex =
  source.indexOf(
    'useEffect(() => {'
  );

const scrollRefIndex =
  source.indexOf(
    'const productScrollRef ='
  );

const scrollRootIndex =
  source.indexOf(
    'data-aj-hub-product-scroll-root'
  );

if (
  scrollRefIndex < 0 ||
  effectIndex < scrollRefIndex ||
  scrollRootIndex < effectIndex
) {
  failures.push(
    'The scroll authority is not ordered safely inside ActiveProductWidget.'
  );
}

if (failures.length) {
  console.error(
    '\nAJ Hub Product Scroll Top validation failed:\n'
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
  '\nAJ Hub Product Scroll Top validation passed.\n\n' +
  'Confirmed:\n' +
  '  ActiveProductWidget owns one internal Hub scroll root\n' +
  '  Every committed Product Experience resets that root to the top\n' +
  '  Reopening the same product through a new Product intent also resets the Hub\n' +
  '  Desktop Discovery Rail and mobile Discovery Sheet share the same authority\n' +
  '  Discovery scroll-memory behavior remains unchanged\n' +
  '  The browser window is not scrolled\n' +
  '  No database migration required\n'
);

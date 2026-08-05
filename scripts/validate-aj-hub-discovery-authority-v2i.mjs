#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const files = {
  "active": "components/ActiveProductWidget.tsx",
  "continuity": "components/discovery-hub-panel/components/DiscoveryContinuityCarousel.tsx",
  "insight": "components/discovery-hub-panel/widgets/ProductDeepInsightWidget.tsx",
  "styles": "features/product-page/components/ProductPageExperience.module.css",
  "validator": "scripts/validate-aj-hub-discovery-authority-v2i.mjs"
};
const failures = [];

function read(key) {
  const target = path.join(root, files[key]);
  if (!fs.existsSync(target)) {
    failures.push(`Missing: ${files[key]}`);
    return '';
  }
  return fs.readFileSync(target, 'utf8').replace(/\r\n/g, '\n');
}

const active = read('active');
const continuity = read('continuity');
const insight = read('insight');
const styles = read('styles');

const activePageCalls = (active.match(/openProductPageFromHub\s*\(/g) ?? []).length;

if (!active.includes('AJ_HUB_DISCOVERY_CARDS_PREVIEW_ONLY_V2I') || !active.includes('previewProductFromHub')) {
  failures.push('Active Product Hub preview-card authority is missing.');
}

if (activePageCalls !== 1 || !active.includes('View more')) {
  failures.push('Only the Active Product View more control may open a Product Page.');
}

if (!continuity.includes('AJ_HUB_DISCOVERY_CARDS_PREVIEW_ONLY_V2I') || !continuity.includes('previewContinuityProduct')) {
  failures.push('Continuity cards are not Hub-preview-only.');
}

if (continuity.includes('openProductPageFromHub') || continuity.includes('router.push(')) {
  failures.push('Continuity still contains direct Product Page navigation.');
}

if (!insight.includes('AJ_HUB_DISCOVERY_CARDS_PREVIEW_ONLY_V2I') || !insight.includes("source:\n          'deep-insight'")) {
  failures.push('Deep Insight cards are not routed back into the Hub preview.');
}

if (insight.includes('router.push(') || insight.includes('useRouter')) {
  failures.push('Deep Insight still contains direct Product Page navigation.');
}

if (!styles.includes('AJ_PRODUCT_PAGE_V2I_BALANCED_HERO_COLUMNS') || !styles.includes('minmax(0, 0.94fr) minmax(21rem, 1.06fr)')) {
  failures.push('The Product Page details column was not widened.');
}

if (failures.length) {
  console.error('[validate-aj-hub-discovery-authority-v2i] Validation failed.');
  for (const failure of failures) console.error('- ' + failure);
  process.exit(1);
}

console.log('[validate-aj-hub-discovery-authority-v2i] Hub cards remain inside the Discovery Workspace; only View more opens the Product Page; the Product Page details column is wider.');

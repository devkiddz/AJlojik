import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx');

if (!fs.existsSync(target)) {
  throw new Error('Missing ProductExperienceCard.tsx');
}

const source = fs.readFileSync(target, 'utf8');

for (const required of [
  'AJ_FEATURED_RAIL_ICON_SEND_V1',
  'data-aj-featured-rail-photo-card',
  'title="Send to Discovery Hub"',
  'mb-2 grid size-8 place-items-center rounded-full',
  '<Send className="size-3.5" />',
  'w-full truncate text-xs font-bold'
]) {
  if (!source.includes(required)) {
    throw new Error(`ProductExperienceCard.tsx is missing: ${required}`);
  }
}

const compactStart = source.indexOf('if (compact) {');
const defaultReturn = source.indexOf('console.count', compactStart);
const compactBlock = source.slice(compactStart, defaultReturn > compactStart ? defaultReturn : undefined);

for (const forbidden of [
  '>Send<',
  'h-8 w-full items-center justify-center',
  'gap-1.5 rounded-full',
  'mt-2 inline-flex'
]) {
  if (compactBlock.includes(forbidden)) {
    throw new Error(`Compact featured rail still contains the wide Send button pattern: ${forbidden}`);
  }
}

if (compactBlock.indexOf('title="Send to Discovery Hub"') > compactBlock.indexOf('<h3')) {
  throw new Error('Send icon must render above the product title.');
}

console.log('AJ featured rail icon-send validation passed.');

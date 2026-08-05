import fs from 'node:fs';
import path from 'node:path';

const target = path.join(process.cwd(), 'features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx');

if (!fs.existsSync(target)) {
  throw new Error('Missing ProductExperienceCard.tsx');
}

const source = fs.readFileSync(target, 'utf8');

for (const required of [
  'AJ_FEATURED_RAIL_DARK_SEND_V1',
  'data-aj-featured-rail-photo-card',
  'title="Send to Discovery Hub"',
  'bg-black/80',
  'text-white',
  'hover:bg-black/95',
  'shadow-[0_8px_24px_rgba(0,0,0,0.48)]'
]) {
  if (!source.includes(required)) {
    throw new Error(`ProductExperienceCard.tsx is missing: ${required}`);
  }
}

const compactStart = source.indexOf('if (compact) {');
const defaultReturn = source.indexOf('console.count', compactStart);
const compactBlock = source.slice(compactStart, defaultReturn > compactStart ? defaultReturn : undefined);

for (const forbidden of [
  'bg-white/92 text-black',
  'hover:bg-white focus-visible'
]) {
  if (compactBlock.includes(forbidden)) {
    throw new Error(`Featured rail still contains the pale Send treatment: ${forbidden}`);
  }
}

console.log('AJ featured rail dark-send validation passed.');

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const target = path.join(root, 'features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx');

if (!fs.existsSync(target)) {
  throw new Error('Missing ProductExperienceCard.tsx');
}

const source = fs.readFileSync(target, 'utf8');

for (const required of [
  'AJ_FEATURED_RAIL_PHOTO_CARDS_V1',
  'data-aj-featured-rail-photo-card',
  'actions.previewProduct(product)',
  'bg-gradient-to-t from-black/90',
  'truncate text-xs font-bold',
  '<Send className=\"size-3.5\" />',
  'Send'
]) {
  if (!source.includes(required)) {
    throw new Error(`ProductExperienceCard.tsx is missing: ${required}`);
  }
}

const compactStart = source.indexOf('if (compact) {');
const defaultReturn = source.indexOf('console.count', compactStart);
const compactBlock = source.slice(compactStart, defaultReturn > compactStart ? defaultReturn : undefined);

for (const forbidden of [
  'ProductActionTray',
  'product.rating',
  'product.reviews',
  'selectedVariant.price',
  'selectedVariant.stockLeft',
  'product.category',
  'product.discountPercentage',
  'product.isNew'
]) {
  if (compactBlock.includes(forbidden)) {
    throw new Error(`Compact featured rail still contains commerce detail: ${forbidden}`);
  }
}

console.log('AJ featured rail photo-card validation passed.');

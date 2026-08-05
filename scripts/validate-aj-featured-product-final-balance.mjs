import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const targets = {
  featuredCard: path.join(root, 'features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx'),
  featuredStage: path.join(root, 'features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx'),
  railCard: path.join(root, 'features/feed-experience/modules/category-product-experience/ProductExperienceCard.tsx')
};

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${path.relative(root, file)}`);
  }

  return fs.readFileSync(file, 'utf8');
}

function requireAll(source, label, values) {
  for (const value of values) {
    if (!source.includes(value)) {
      throw new Error(`${label} is missing: ${value}`);
    }
  }
}

function forbidAll(source, label, values) {
  for (const value of values) {
    if (source.includes(value)) {
      throw new Error(`${label} still contains obsolete presentation: ${value}`);
    }
  }
}

const featuredCard = read(targets.featuredCard);
const featuredStage = read(targets.featuredStage);
const railCard = read(targets.railCard);

requireAll(featuredCard, 'FeaturedProductExperienceCard.tsx', [
  'AJ_FEATURED_PRODUCT_FINAL_BALANCE_V1',
  'h-[13.25rem] max-h-[13.25rem]',
  'justify-center'
]);

forbidAll(featuredCard, 'FeaturedProductExperienceCard.tsx', [
  'h-[12.75rem] max-h-[12.75rem]'
]);

requireAll(featuredStage, 'CategoryProductExperienceSection.tsx', [
  'AJ_FEATURED_PRODUCT_FINAL_BALANCE_STAGE_V1',
  'flex h-[14rem] min-w-0 flex-col',
  'relative h-[13.25rem] min-w-0 shrink-0',
  'mt-auto flex h-3 items-end justify-center gap-1.5',
  'h-[14rem] min-w-0 overflow-hidden rounded-3xl'
]);

requireAll(railCard, 'ProductExperienceCard.tsx', [
  'AJ_FEATURED_PRODUCT_RAIL_ONE_LINE_V1',
  "compact ? 'aspect-[4/3]' : 'aspect-square'",
  "line-clamp-1 min-h-4 text-[11px] leading-4",
  "compact ? 'min-h-[4rem] pt-1.5'"
]);

forbidAll(railCard, 'ProductExperienceCard.tsx', [
  "compact ? 'aspect-[5/4]' : 'aspect-square'",
  "compact ? 'min-h-8 text-[11px] leading-4'"
]);

console.log('AJ featured-product final balance validation passed.');

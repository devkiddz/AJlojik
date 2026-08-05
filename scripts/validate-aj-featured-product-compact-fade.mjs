import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const targets = {
  card: path.join(
    root,
    'features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx'
  ),
  stage: path.join(
    root,
    'features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx'
  )
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

const card = read(targets.card);
const stage = read(targets.stage);

requireAll(card, 'FeaturedProductExperienceCard.tsx', [
  'AJ_FEATURED_PRODUCT_COMPACT_FADE_V1',
  'h-[12.75rem]',
  'max-w-[26rem]',
  'grid-cols-[minmax(7.25rem,0.82fr)_minmax(0,1.18fr)]',
  'flex min-w-0 flex-col justify-center',
  'size-9 shrink-0'
]);

forbidAll(card, 'FeaturedProductExperienceCard.tsx', [
  'min-h-[15rem]',
  'min-h-48 overflow-hidden',
  'mt-auto flex items-end'
]);

requireAll(stage, 'CategoryProductExperienceSection.tsx', [
  'AJ_FEATURED_PRODUCT_COMPACT_FADE_STAGE_V1',
  'data-aj-featured-fade-stage',
  'relative h-[12.75rem]',
  'transition-opacity duration-700 ease-in-out',
  'opacity-100 pointer-events-auto',
  'opacity-0 pointer-events-none',
  "lg:grid-cols-[minmax(24rem,27rem)_minmax(0,1fr)]",
  'setActiveFeaturedIndex(',
  'featuredStageProducts.length'
]);

forbidAll(stage, 'CategoryProductExperienceSection.tsx', [
  'featuredSlides',
  'featuredTransitionEnabled',
  'handleFeaturedTransitionEnd',
  'transition-transform duration-700',
  'translate3d('
]);

console.log('AJ compact featured fade validation passed.');

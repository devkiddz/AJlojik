import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const targets = {
  card: path.join(root, 'features/feed-experience/modules/category-product-experience/FeaturedProductExperienceCard.tsx'),
  stage: path.join(root, 'features/feed-experience/modules/category-product-experience/CategoryProductExperienceSection.tsx'),
  renderer: path.join(root, 'features/feed-experience/renderers/FeedRenderer.tsx')
};

function read(file) {
  if (!fs.existsSync(file)) {
    throw new Error(`Missing required file: ${path.relative(root, file)}`);
  }

  return fs.readFileSync(file, 'utf8');
}

function requireAll(source, file, values) {
  for (const value of values) {
    if (!source.includes(value)) {
      throw new Error(`${file} is missing: ${value}`);
    }
  }
}

function forbidAll(source, file, values) {
  for (const value of values) {
    if (source.includes(value)) {
      throw new Error(`${file} still contains obsolete featured-card behavior: ${value}`);
    }
  }
}

const card = read(targets.card);
const stage = read(targets.stage);
const renderer = read(targets.renderer);

requireAll(card, 'FeaturedProductExperienceCard.tsx', [
  'AJ_FEATURED_PRODUCT_SHOWCASE_V2',
  'data-aj-featured-product-showcase',
  'product.variants.map(',
  'Send product to Discovery Hub',
  'actions.previewProduct(',
  'aria-pressed={',
  '<Send className='
]);

forbidAll(card, 'FeaturedProductExperienceCard.tsx', [
  'ProductActionTray',
  '<Select',
  'shortDescription',
  'Add to Cart',
  'Details'
]);

requireAll(stage, 'CategoryProductExperienceSection.tsx', [
  'AJ_FEATURED_PRODUCT_STAGE_V2',
  'data-aj-featured-product-stage',
  'featuredSlides',
  'handleFeaturedTransitionEnd',
  'window.setInterval(',
  'advanceRail',
  'data-aj-featured-product-auto-rail',
  "'(prefers-reduced-motion: reduce)'"
]);

requireAll(renderer, 'FeedRenderer.tsx', [
  'AJ_FEATURED_MODULE_UNIFICATION_V1',
  'unifyFeaturedProductModules',
  'featuredModules.length <=',
  'resolvedModules.map(',
  'combinedFeaturedProducts',
  'combinedProducts'
]);

console.log('AJ featured product stage validation passed.');

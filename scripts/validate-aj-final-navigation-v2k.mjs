#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = relativePath => fs.readFileSync(path.join(root, relativePath), 'utf8');
const fail = message => {
  console.error(`[validate-aj-final-navigation-v2k] ${message}`);
  process.exit(1);
};

const active = read('components/ActiveProductWidget.tsx');
const desktop = read('components/discovery-hub-panel/DesktopDiscoveryRail.tsx');
const mobile = read('components/discovery-hub-panel/DiscoverExperienceShell.tsx');
const host = read('features/feed-experience/layout/GlobalDiscoveryHost.tsx');
const css = read('features/product-page/components/ProductPageExperience.module.css');
const mobileShell = read('components/layout/MobileApplicationShell.tsx');

if (!mobileShell.includes('<MobileBottomNavigation')) {
  fail('MobileApplicationShell no longer renders MobileBottomNavigation.');
}

if (!css.includes('AJ_PRODUCT_PAGE_MOBILE_NAV_CLEARANCE_V2K') ||
    !css.includes('bottom: calc(5.75rem + env(safe-area-inset-bottom));')) {
  fail('Product Page mobile action bar does not preserve clearance for the bottom navigator.');
}

if (!active.includes('AJ_HUB_CLOSE_BEFORE_PRODUCT_PAGE_V2K') ||
    !active.includes('onBeforeOpenProductPage?: () => void;') ||
    !active.includes('onBeforeOpenProductPage?.();')) {
  fail('ActiveProductWidget does not close its Hub surface before Product Page navigation.');
}

if (!desktop.includes('AJ_DESKTOP_HUB_CLOSE_BEFORE_PRODUCT_PAGE_V2K') ||
    !desktop.includes('onBeforeOpenProductPage={() => {') ||
    !desktop.includes('onCollapsedChange(')) {
  fail('Desktop Hub does not collapse before Product Page handoff.');
}

if (!mobile.includes('AJ_MOBILE_HUB_CLOSE_BEFORE_PRODUCT_PAGE_V2K') ||
    !mobile.includes('useMobileDiscovery') ||
    !mobile.includes('onBeforeOpenProductPage={') ||
    !mobile.includes('closeDiscovery')) {
  fail('Mobile Hub does not close before Product Page handoff.');
}

if (!host.includes('AJ_PRODUCT_PAGE_HUB_HANDOFF_COLLAPSED_V2K') ||
    host.includes('AJ_PRODUCT_PAGE_HUB_EXPANSION_V1') ||
    /pathname\.startsWith\('\/products\/'\)[\s\S]{0,120}setCollapsed\(false\)/.test(host)) {
  fail('Product Page navigation can still force the Desktop Hub open.');
}

console.log('[validate-aj-final-navigation-v2k] Mobile navigation clearance and Hub-close Product Page handoff passed.');

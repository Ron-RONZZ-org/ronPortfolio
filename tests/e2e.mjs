/**
 * End-to-end tests for the portfolio site.
 * Run: node tests/e2e.mjs
 * Requires: preview server running on localhost:4322
 */

import { chromium } from 'playwright';

const BASE = 'http://localhost:4322';
const SUPPORTED_LANGS = ['en', 'fr', 'zh'];

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
  } else {
    failed++;
    console.error(`  ✗ ${msg}`);
  }
}

async function pageInFreshContext(browser) {
  // Each page gets its own context so localStorage doesn't leak between tests
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') console.error('  [browser console]', msg.text());
  });
  return { ctx, page };
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  // ── 1. Home page ──────────────────────────────────
  console.log('\n=== Home page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });

    assert(await page.title() !== '', 'Page has a title');
    assert(await page.locator('h1').textContent() === 'Ron', 'Shows "Ron" heading');
    assert(await page.locator('.profile-photo').count() === 1, 'Has profile photo');
    assert(await page.locator('.lang-btn').count() === 3, 'Has 3 language toggle buttons');
    assert(await page.locator('.link-card').count() >= 4, 'Has 4+ link cards');

    // Check links go to correct paths
    const links = await page.locator('.link-card').all();
    const hrefs = await Promise.all(links.map(l => l.getAttribute('href')));
    assert(hrefs.includes('/cv'), 'Has link to /cv');
    assert(hrefs.includes('/contact'), 'Has link to /contact');
    assert(hrefs.includes('/blog'), 'Has link to /blog');

    // language toggle works
    await page.locator('.lang-btn[data-lang="fr"]').click();
    await page.waitForTimeout(300);
    const frText = await page.locator('[data-i18n="bio"]').textContent();
    assert(frText.includes('Salut'), 'French toggle works: bio shows French');

    // Switch to Chinese
    await page.locator('.lang-btn[data-lang="zh"]').click();
    await page.waitForTimeout(300);
    const zhText = await page.locator('[data-i18n="bio"]').textContent();
    assert(zhText.includes('你好'), 'Chinese toggle works: bio shows Chinese');

    // Switch back to English
    await page.locator('.lang-btn[data-lang="en"]').click();
    await page.waitForTimeout(300);
    const enText = await page.locator('[data-i18n="bio"]').textContent();
    assert(enText.includes('Hi, I am Ron'), 'English toggle works: bio shows English');

    await ctx.close();
  }

  // ── 2. CV page ────────────────────────────────────
  console.log('\n=== CV page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/cv/`, { waitUntil: 'networkidle' });

    assert(await page.locator('h1').textContent() === 'My Journey', 'CV page heading');
    assert(await page.locator('.filter-btn').count() === 5, 'Has 5 filter buttons');
    assert(await page.locator('.filter-btn.active').count() === 1, 'One filter active by default');
    assert(await page.locator('.milestone').count() === 30, 'Has 30 milestone entries (10 × 3 languages)');

    // All milestones for non-English languages should be hidden by default
    const visibleCount = await page.locator('.milestone:not(.hidden-by-lang):not(.hidden)').count();
    assert(visibleCount > 0, `Has ${visibleCount} visible milestones in default language`);

    // Filter by category
    const eduBtn = page.locator('.filter-btn.education');
    await eduBtn.click();
    await page.waitForTimeout(200);
    const visibleEdu = await page.locator('.milestone:not(.hidden-by-lang):not(.hidden)').count();
    assert(visibleEdu > 0, 'Education filter shows milestones');

    // Switch language on CV page
    await page.locator('.lang-btn[data-lang="fr"]').click();
    await page.waitForTimeout(300);
    const frTitle = await page.locator('h1').textContent();
    assert(frTitle === 'Mon Parcours', 'CV page heading switches to French');

    // Reset filter to All
    await page.locator('.filter-btn.all').click();
    await page.waitForTimeout(200);

    await ctx.close();
  }

  // ── 3. Contact page ───────────────────────────────
  console.log('\n=== Contact page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/contact/`, { waitUntil: 'networkidle' });

    const h1Text = await page.locator('h1').textContent();
    assert(h1Text === 'Get In Touch', 'Contact page heading');
    assert(await page.locator('.contact-item').count() >= 3, 'Has 3+ contact items');
    assert(await page.locator('a[href="mailto:hi@rongzhou.me"]').count() === 1, 'Has email link');
    assert(await page.locator('.back-link').count() === 1, 'Has back link');

    // i18n
    await page.locator('.lang-btn[data-lang="zh"]').click();
    await page.waitForTimeout(300);
    const zhHeading = await page.locator('h1').textContent();
    assert(zhHeading === '取得联系', 'Contact page heading switches to Chinese');

    await ctx.close();
  }

  // ── 4. Blog page ──────────────────────────────────
  console.log('\n=== Blog page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/blog/`, { waitUntil: 'networkidle' });

    assert(await page.locator('h1').textContent() === 'Blog', 'Blog page heading');
    assert(await page.locator('#blog-search').count() === 1, 'Has search input');
    assert(await page.locator('#blog-sort').count() === 1, 'Has sort select');
    assert(await page.locator('#blog-list').count() === 1, 'Has article list');

    // No articles → "No articles found" should be visible
    const noResults = await page.locator('#blog-no-results');
    assert(await noResults.isVisible(), 'No-results message visible when no articles');
    assert(await noResults.textContent() !== '', 'No-results has text');

    await ctx.close();
  }

  // ── 5. Language picker page ───────────────────────
  console.log('\n=== Language picker ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/language/`, { waitUntil: 'networkidle' });

    assert(await page.locator('h1').textContent() === 'Choose Your Language', 'Language picker heading');
    assert(await page.locator('.lang-option').count() === 3, 'Has 3 language options');

    // Click a language option → navigates to /
    await page.locator('.lang-option').first().click();
    await page.waitForTimeout(500);
    assert(page.url().includes('/'), 'Language picker navigates to /');

    await ctx.close();
  }

  // ── 6. 404 page ───────────────────────────────────
  console.log('\n=== 404 page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    const resp = await page.goto(`${BASE}/does-not-exist/`, { waitUntil: 'networkidle' });
    assert(resp?.status() === 404, 'Returns 404 status for unknown page');
    assert(await page.locator('h1').textContent() === '404', '404 heading');
    assert(await page.locator('text=Go Home').count() === 1, 'Has Go Home link');

    await ctx.close();
  }

  // ── 7. Language detection banner ──────────────────
  console.log('\n=== Language detection banner ===');
  {
    // Verify banner element exists in the DOM
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    assert(await page.locator('#lang-banner').count() === 1, 'Banner element exists in DOM');

    // With English browser locale, banner should NOT be visible
    await page.waitForTimeout(500); // let i18n script run after DOMContentLoaded
    const bannerVisible = await page.locator('#lang-banner').isVisible();
    const bannerHasClass = await page.locator('#lang-banner').evaluate(el => el.classList.contains('visible'));
    console.log(`  Banner visible=${bannerVisible}, has .visible class=${bannerHasClass}`);
    assert(!bannerVisible, 'Banner hidden when language is detected');

    await ctx.close();
  }

  // ── Summary ───────────────────────────────────────
  console.log(`\n${'='.repeat(40)}`);
  const total = passed + failed;
  console.log(`Results: ${passed}/${total} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);

  await browser.close();
}

run().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});

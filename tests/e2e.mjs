/**
 * End-to-end tests for the portfolio site.
 * Run: node tests/e2e.mjs
 * Requires: preview server running on localhost:4322
 */

import { chromium } from 'playwright';

const BASE = 'http://127.0.0.1:4322';
const SUPPORTED_LANGS = ['en', 'fr', 'zh', 'eo'];
const CV_SLUGS = 13;    // unique CV entry slugs
const PORTFOLIO_SLUGS = 6; // unique portfolio entry slugs

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
    assert(await page.locator('.lang-btn').count() === SUPPORTED_LANGS.length, `Has ${SUPPORTED_LANGS.length} language toggle buttons`);
    assert(await page.locator('.link-card').count() >= 7, 'Has 7+ link cards');

    // Check links go to correct paths
    const links = await page.locator('.link-card').all();
    const hrefs = await Promise.all(links.map(l => l.getAttribute('href')));
    assert(hrefs.includes('/hi'), 'Has link to /hi');
    assert(hrefs.includes('/cv'), 'Has link to /cv');
    assert(hrefs.includes('/contact'), 'Has link to /contact');
    assert(hrefs.includes('/portfolio'), 'Has link to /portfolio');
    assert(hrefs.includes('/research'), 'Has link to /research');
    assert(hrefs.includes('/FOSS'), 'Has link to /FOSS');
    assert(hrefs.includes('/inspire'), 'Has link to /inspire');

    // language toggle works – cycle through all supported languages
    await page.locator('.lang-btn[data-lang="fr"]').click();
    await page.waitForTimeout(300);
    const frText = await page.locator('[data-i18n="bio"]').textContent();
    assert(frText.includes('Salut'), 'French toggle works: bio shows French');

    await page.locator('.lang-btn[data-lang="zh"]').click();
    await page.waitForTimeout(300);
    const zhText = await page.locator('[data-i18n="bio"]').textContent();
    assert(zhText.includes('你好'), 'Chinese toggle works: bio shows Chinese');

    await page.locator('.lang-btn[data-lang="eo"]').click();
    await page.waitForTimeout(300);
    const eoText = await page.locator('[data-i18n="bio"]').textContent();
    assert(eoText.includes('Saluton'), 'Esperanto toggle works: bio shows Esperanto');

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
    assert(await page.locator('.filter-btn').count() === 6, 'Has 6 filter buttons (4 categories + select/deselect all)');
    assert(await page.locator('.filter-btn.active').count() === 4, 'All 4 category buttons active by default');
    const expectedMilestones = CV_SLUGS * SUPPORTED_LANGS.length;
    assert(await page.locator('.milestone').count() === expectedMilestones, `Has ${expectedMilestones} milestone entries (${CV_SLUGS} × ${SUPPORTED_LANGS.length} languages)`);

    // All milestones for default language should be visible (all categories selected)
    const initialVisible = await page.locator('.milestone:not(.hidden-by-lang):not(.hidden)').count();
    assert(initialVisible > 0, `Has ${initialVisible} visible milestones in default language`);

    // Toggle education OFF → education milestones should be hidden
    const eduBtn = page.locator('.filter-btn.education');
    await eduBtn.click();
    await page.waitForTimeout(200);
    assert(await eduBtn.evaluate(el => !el.classList.contains('active')), 'Education button no longer active after toggle off');
    const withoutEdu = await page.locator('.milestone:not(.hidden-by-lang):not(.hidden)').count();
    assert(withoutEdu < initialVisible, `Fewer visible (${withoutEdu} < ${initialVisible}) after deselecting education`);

    // Toggle education back ON → all milestones visible again
    await eduBtn.click();
    await page.waitForTimeout(200);
    assert(await eduBtn.evaluate(el => el.classList.contains('active')), 'Education button active after toggle on');
    const withEdu = await page.locator('.milestone:not(.hidden-by-lang):not(.hidden)').count();
    assert(withEdu === initialVisible, `Same visible count (${withEdu} === ${initialVisible}) after re-selecting education`);

    // Deselect All → all milestones hidden
    await page.locator('.filter-btn.deselect-all').click();
    await page.waitForTimeout(200);
    const allHidden = await page.locator('.milestone:not(.hidden-by-lang):not(.hidden)').count();
    assert(allHidden === 0, 'All milestones hidden after Deselect All');

    // Select All → all milestones visible again
    await page.locator('.filter-btn.select-all').click();
    await page.waitForTimeout(200);
    const allVisible = await page.locator('.milestone:not(.hidden-by-lang):not(.hidden)').count();
    assert(allVisible === initialVisible, `All milestones visible (${allVisible} === ${initialVisible}) after Select All`);

    // Switch language on CV page while filter is active
    await page.locator('.lang-btn[data-lang="fr"]').click();
    await page.waitForTimeout(300);
    const frTitle = await page.locator('h1').textContent();
    assert(frTitle === 'Mon Parcours', 'CV page heading switches to French');

    await ctx.close();
  }

  // ── 3. Contact page ───────────────────────────────
  console.log('\n=== Contact page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/contact/`, { waitUntil: 'networkidle' });

    const h1Text = await page.locator('h1').textContent();
    assert(h1Text === 'Get In Touch', 'Contact page heading');
    assert(await page.locator('.contact-item').count() === 2, 'Has 2 contact items');
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
    assert(await page.locator('.lang-option').count() === SUPPORTED_LANGS.length, `Has ${SUPPORTED_LANGS.length} language options`);

    // Click a language option → navigates to /
    await page.locator('.lang-option').first().click();
    await page.waitForTimeout(500);
    assert(page.url().includes('/'), 'Language picker navigates to /');

    await ctx.close();
  }

  // ── 6. Portfolio page ─────────────────────────────
  console.log('\n=== Portfolio page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/portfolio/`, { waitUntil: 'networkidle' });

    assert(await page.locator('h1').textContent() === 'Portfolio of Projects', 'Portfolio page heading');
    const expectedPortfolioCards = PORTFOLIO_SLUGS * SUPPORTED_LANGS.length;
    assert(await page.locator('.portfolio-card').count() === expectedPortfolioCards, `Has ${expectedPortfolioCards} portfolio entries (${PORTFOLIO_SLUGS} × ${SUPPORTED_LANGS.length} languages)`);
    assert(await page.locator('.back-link').count() === 1, 'Has back link');

    // Filter buttons
    assert(await page.locator('.filter-btn').count() === 5, 'Portfolio has 5 filter buttons (3 categories + select/deselect all)');
    assert(await page.locator('.filter-btn.software.active').count() === 1, 'Software filter active by default');
    assert(await page.locator('.filter-btn.research.active').count() === 1, 'Research filter active by default');
    assert(await page.locator('.filter-btn.association.active').count() === 1, 'Association filter active by default');

    // Toggle software OFF → fewer visible cards
    const initialPortfolioCards = await page.locator('.portfolio-card:not(.hidden-by-lang):not(.hidden)').count();
    await page.locator('.filter-btn.software').click();
    await page.waitForTimeout(200);
    const withoutSoftware = await page.locator('.portfolio-card:not(.hidden-by-lang):not(.hidden)').count();
    assert(withoutSoftware < initialPortfolioCards, `Fewer cards visible (${withoutSoftware} < ${initialPortfolioCards}) after deselecting software`);

    // Select All
    await page.locator('.filter-btn.select-all').click();
    await page.waitForTimeout(200);
    const afterSelectAll = await page.locator('.portfolio-card:not(.hidden-by-lang):not(.hidden)').count();
    assert(afterSelectAll === initialPortfolioCards, `All cards visible again (${afterSelectAll} === ${initialPortfolioCards}) after Select All`);

    // Deselect All → all hidden
    await page.locator('.filter-btn.deselect-all').click();
    await page.waitForTimeout(200);
    const allHiddenPortfolio = await page.locator('.portfolio-card:not(.hidden-by-lang):not(.hidden)').count();
    assert(allHiddenPortfolio === 0, 'All portfolio cards hidden after Deselect All');

    // i18n
    await page.locator('.lang-btn[data-lang="fr"]').click();
    await page.waitForTimeout(300);
    const frHeading = await page.locator('h1').textContent();
    assert(frHeading === 'Portfolio de projets', 'Portfolio heading switches to French');

    await ctx.close();
  }

  // ── 7. Research page ──────────────────────────────
  console.log('\n=== Research page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/research/`, { waitUntil: 'networkidle' });

    assert(await page.locator('h1').textContent() === 'Academic Research', 'Research page heading');
    assert(await page.locator('.external-link-item').count() === 2, 'Has 2 research links');
    assert(await page.locator('a[href*="orcid.org"]').count() === 1, 'Has ORCID link');
    assert(await page.locator('a[href*="hal.science"]').count() === 1, 'Has HAL link');

    await ctx.close();
  }

  // ── 8. Projects page ──────────────────────────────
  console.log('\n=== Projects page ===');
  {
    const { ctx, page } = await pageInFreshContext(browser);
    await page.goto(`${BASE}/projects/`, { waitUntil: 'networkidle' });

    assert(await page.locator('h1').textContent() === 'Programming Projects', 'Projects page heading');
    assert(await page.locator('.external-link-item').count() === 2, 'Has 2 project links');
    assert(await page.locator('a[href*="github.com/Ron-RONZZ-org"]').count() >= 1, 'Has GitHub link');
    assert(await page.locator('a[href*="midiverse.org"]').count() === 1, 'Has Midiverse link');

    await ctx.close();
  }

  // ── 9. 404 page ───────────────────────────────────
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

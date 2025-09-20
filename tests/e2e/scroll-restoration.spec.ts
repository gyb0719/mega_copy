import { test, expect } from '@playwright/test';

const mockProducts = Array.from({ length: 100 }).map((_, index) => ({
  id: `${index + 1}`,
  name: `테스트 상품 ${index + 1}`,
  brand: '테스트 브랜드',
  price: 120000 + index * 1000,
  category: '전체',
  description: '스크롤 복원 기능 검증용 상품',
  created_at: new Date(2024, 0, index + 1).toISOString(),
  product_images: [
    {
      id: `${index + 1}-image`,
      image_url: `https://example.com/product-${index + 1}.jpg`,
      display_order: 1,
    },
  ],
}));

test.describe('메인 스크롤 복원', () => {
  test('상품 상세 이동 및 새로고침 후에도 동일 위치로 복원된다', async ({ page }) => {
    page.on('console', (msg) => {
      const text = msg.text();
      if (text.startsWith('ScrollRestorer')) {
        console.log(`[browser] ${text}`);
      }
    });

    await page.route('**/rest/v1/**', async (route) => {
      const url = new URL(route.request().url());

      if (url.pathname.endsWith('/rpc/get_products')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, data: mockProducts }),
        });
        return;
      }

      if (url.pathname.endsWith('/products')) {
        const idParam = url.searchParams.get('id') ?? '';
        const id = idParam.replace('eq.', '') || '1';
        const product = mockProducts.find((item) => item.id === id) ?? mockProducts[0];

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...product,
            stock: 3,
          }),
        });
        return;
      }

      if (url.pathname.endsWith('/product_images')) {
        const productIdParam = url.searchParams.get('product_id') ?? '';
        const productId = productIdParam.replace('eq.', '') || '1';
        const product = mockProducts.find((item) => item.id === productId);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(product?.product_images ?? []),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/');

    const productCards = page.locator('a[href*="/product/?id="]');
    await expect(productCards.first()).toBeVisible();

    for (let i = 0; i < 4; i += 1) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(700);
    }

    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight - 400, behavior: 'auto' }));
    await page.waitForTimeout(400);

    const targetProductCard = productCards.last();
    await targetProductCard.waitFor({ state: 'visible' });
    const productName = (await targetProductCard.locator('h3').first().textContent())?.trim() ?? '';
    expect(productName).not.toEqual('');

    const storedBeforeClick = await page.evaluate(() => sessionStorage.getItem('scroll-position:/?'));
    console.log('[test] storedBeforeClick', storedBeforeClick);

    const scrolledPosition = await page.evaluate(() => window.scrollY);
    expect(scrolledPosition).toBeGreaterThan(2500);

    await targetProductCard.click();
    await expect(page.getByRole('heading', { level: 1, name: new RegExp(productName) })).toBeVisible();

    await page.goBack();
    await page.waitForTimeout(100);
    await page.waitForFunction(() => window.scrollY > 2500, undefined, { timeout: 5000 });
    await expect(page.locator('h3').filter({ hasText: productName }).first()).toBeVisible();

    const afterBackPosition = await page.evaluate(() => window.scrollY);
    expect(Math.abs(afterBackPosition - scrolledPosition)).toBeLessThan(120);

    await page.reload({ waitUntil: 'networkidle' });

    await page.waitForFunction(() => window.scrollY > 2500, undefined, { timeout: 5000 });
    await expect(page.locator('h3').filter({ hasText: productName }).first()).toBeVisible();

    const afterReloadPosition = await page.evaluate(() => window.scrollY);
    expect(Math.abs(afterReloadPosition - scrolledPosition)).toBeLessThan(120);
  });
});

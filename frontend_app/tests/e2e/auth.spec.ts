import { test, expect } from '@playwright/test';

test.describe('Auth & routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('homepage loads and shows branding', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=ZeroPlagiarism')).toBeVisible();
  });

  test('protected route redirects to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test('sign-in shows error on invalid credentials (mocked response)', async ({ page }) => {
    await page.route('**/api/login/', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invalid credentials' }),
      });
    });

    await page.goto('/sign-in');
    await page.fill('[data-testid="email-input"]', 'noone@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpass');
    await page.click('[data-testid="sign-in-submit"]');

    await expect(page).toHaveURL(/\/sign-in/);
    await expect(page.locator('text=Invalid credentials')).toBeVisible({ timeout: 3000 });
  });
});

# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth & routing >> protected route redirects to sign-in when not authenticated
- Location: tests/e2e/auth.spec.ts:9:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/sign-in/
Received string:  "http://localhost:3000/dashboard"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × locator resolved to <html>…</html>
       - unexpected value "http://localhost:3000/dashboard"

```

```yaml
- heading "404 Not Found" [level=1]
- separator
- text: nginx/1.31.3
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Auth & routing', () => {
  4  |   test('homepage loads and shows branding', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page.locator('text=ZeroPlagiarism')).toBeVisible();
  7  |   });
  8  | 
  9  |   test('protected route redirects to sign-in when not authenticated', async ({ page }) => {
  10 |     await page.goto('/dashboard');
> 11 |     await expect(page).toHaveURL(/\/sign-in/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  12 |   });
  13 | 
  14 |   test('sign-in shows error on invalid credentials (mocked response)', async ({ page }) => {
  15 |     // Intercept the login API and return an invalid credentials response
  16 |     await page.route('http://localhost:8000/api/login/', async (route) => {
  17 |       await route.fulfill({
  18 |         status: 400,
  19 |         contentType: 'application/json',
  20 |         body: JSON.stringify({ error: 'Invalid credentials' }),
  21 |       });
  22 |     });
  23 | 
  24 |     await page.goto('/sign-in');
  25 |     await page.fill('input[type="email"]', 'noone@example.com');
  26 |     await page.fill('input[type="password"]', 'wrongpass');
  27 |     await page.click('button:has-text("Sign In")');
  28 | 
  29 |     // Ensure we stay on the sign-in page
  30 |     await expect(page).toHaveURL(/\/sign-in/);
  31 |     // Check for a visible error message (either the toast or the raw text)
  32 |     await expect(page.locator('text=Login Failed')).toBeVisible({ timeout: 3000 });
  33 |   });
  34 | });
  35 | 
```
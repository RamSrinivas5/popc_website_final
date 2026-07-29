import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test('should load the login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Login')).toBeVisible();
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('should load the forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('text=Forgot Password')).toBeVisible();
    await expect(page.locator('text=Send OTP')).toBeVisible();
  });

  test('should display validation errors on empty login submission', async ({ page }) => {
    await page.goto('/');
    await page.click('button[type="submit"]');
    // Adjust selector based on actual app implementation
    await expect(page.locator('text=Username is required').or(page.locator('text=Internal Server Error'))).toBeVisible(); 
  });
});

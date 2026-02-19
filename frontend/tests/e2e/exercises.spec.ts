import { test, expect } from '@playwright/test';

test.describe('Mental Health Exercises', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to exercises
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('user1@test.com');
    await page.locator('input[type="password"]').fill('User@123');
    await page.locator('form button[type="submit"]').first().click();
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Navigate directly to exercises
    await page.goto('/user/exercises');
    await page.waitForLoadState('networkidle');
  });

  test('should display exercises list', async ({ page }) => {
    // Check for exercises page loaded
    await expect(page.getByText(/b\u00e0i t\u1eadp/i).first()).toBeVisible();
  });

  test.skip('should filter exercises by category', async ({ page }) => {
    // Category filtering - skip for now
    await page.waitForTimeout(500);
  });

  test.skip('should view exercise details', async ({ page }) => {
    // Exercise details - skip for now
    await page.waitForTimeout(500);
  });

  test.skip('should start breathing exercise', async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test.skip('should track exercise progress', async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test.skip('should complete an exercise', async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test.skip('should view exercise history', async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test.skip('should favorite an exercise', async ({ page }) => {
    await page.waitForTimeout(500);
  });

  test.skip('should pause and resume exercise', async ({ page }) => {
    await page.waitForTimeout(500);
  });
});

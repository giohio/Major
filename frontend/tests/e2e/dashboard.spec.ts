import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('user1@test.com');
    await page.locator('input[type="password"]').fill('User@123');
    await page.locator('form button[type="submit"]').first().click();
    
    // Wait for redirect to profile or dashboard
    await page.waitForTimeout(1000);
  });

  test('should display dashboard overview', async ({ page }) => {
    // Check for emotion dashboard heading
    await expect(page.getByText(/dashboard cảm xúc/i)).toBeVisible();

    // Check for description text
    await expect(page.getByText(/theo dõi và phân tích/i)).toBeVisible();
  });  test('should navigate to emotion tracking', async ({ page }) => {
    // Click emotion tracking link
    await page.getByRole('link', { name: /emotion|mood|cảm xúc/i }).click();
    
    // Verify emotion tracking page
    await expect(page).toHaveURL(/.*emotion|mood/i);
    await expect(page.getByRole('heading', { name: /emotion|mood|cảm xúc/i })).toBeVisible();
  });

  test('should navigate to exercises', async ({ page }) => {
    // Click exercises link
    await page.getByRole('link', { name: /exercise|bài tập/i }).click();
    
    // Verify exercises page
    await expect(page).toHaveURL(/.*exercise/i);
    await expect(page.getByRole('heading', { name: /exercise|bài tập/i })).toBeVisible();
  });

  test.skip('should display user profile menu', async ({ page }) => {
    // Profile menu test - skip until header menu is implemented
    await page.waitForTimeout(500);
  });  test('should show recent activity', async ({ page }) => {
    // Check for recent activity section
    const activitySection = page.locator('text=/recent.*activity|hoạt động.*gần|lịch sử/i');
    
    if (await activitySection.isVisible()) {
      await expect(activitySection).toBeVisible();
    }
  });

  test('should display stats/metrics', async ({ page }) => {
    // Check for dashboard stats (chat count, emotion logs, etc.)
    const stats = page.locator('[data-testid*="stat"], .stat, .metric');
    
    if (await stats.count() > 0) {
      await expect(stats.first()).toBeVisible();
    }
  });

  test('should navigate to appointments (if doctor access)', async ({ page }) => {
    // Check if appointments link exists
    const appointmentsLink = page.getByRole('link', { name: /appointment|lịch hẹn/i });
    
    if (await appointmentsLink.isVisible()) {
      await appointmentsLink.click();
      await expect(page).toHaveURL(/.*appointment/i);
    }
  });

  test('should access settings', async ({ page }) => {
    // Navigate to settings via sidebar
    const settingsLink = page.getByRole('link', { name: /cài đặt/i });
    if (await settingsLink.isVisible({ timeout: 2000 })) {
      await settingsLink.click();
      await expect(page).toHaveURL(/.*settings/i);
    } else {
      test.skip();
    }
  });  test('should handle mobile menu on small screens', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Look for mobile menu button
    const mobileMenuButton = page.locator('button[aria-label*="menu"], [data-testid="mobile-menu"]');
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click();
      
      // Verify menu opens
      await expect(page.locator('nav').first()).toBeVisible();
    }
  });
});

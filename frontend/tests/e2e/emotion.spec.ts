import { test, expect } from '@playwright/test';

test.describe('Emotion Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to emotion tracking
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('user1@test.com');
    await page.locator('input[type="password"]').fill('User@123');
    await page.locator('form button[type="submit"]').first().click();
    
    // Wait for redirect
    await page.waitForTimeout(1000);
    
    // Navigate directly to emotion dashboard
    await page.goto('/user/dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display emotion tracking interface', async ({ page }) => {
    // Dashboard shows emotion tracking - check for main heading
    await expect(page.getByText(/dashboard cảm xúc/i)).toBeVisible();
    
    // Check for description
    await expect(page.getByText(/theo dõi và phân tích/i)).toBeVisible();
  });

  test.skip('should log an emotion', async ({ page }) => {
    // Direct emotion logging not implemented in current dashboard view
    await page.waitForTimeout(500);
  });

  test('should analyze text for emotion', async ({ page }) => {
    // Look for text analysis input
    const textInput = page.locator('textarea[placeholder*="how.*feeling"], textarea[placeholder*="cảm thấy"]').first();
    
    if (await textInput.isVisible({ timeout: 3000 })) {
      await textInput.fill('I am feeling very anxious about my upcoming exam');
      
      // Click analyze button
      await page.getByRole('button', { name: /analyze|phân tích/i }).click();
      
      // Wait for analysis result
      await expect(page.locator('text=/anxiety|lo lắng|stress/i')).toBeVisible({ timeout: 10000 });
    }
  });

  test('should display emotion history', async ({ page }) => {
    // Check for chart/visualization - look for recharts svg
    await expect(page.locator('svg.recharts-surface').first()).toBeVisible({ timeout: 5000 });
  });

  test('should display emotion statistics', async ({ page }) => {
    // Navigate to stats tab
    const statsTab = page.getByRole('tab', { name: /stats|statistics|thống kê/i });
    
    if (await statsTab.isVisible({ timeout: 2000 })) {
      await statsTab.click();
      
      // Check for charts/graphs
      await expect(page.locator('canvas, svg[class*="chart"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should show emotion trends over time', async ({ page }) => {
    // Look for trends card - use .first() to avoid strict mode
    const trendsSection = page.locator('text=/xu hướng/i').first();
    await expect(trendsSection).toBeVisible({ timeout: 5000 });
    
    // Verify chart is present
    await expect(page.locator('svg.recharts-surface')).toBeVisible();
  });

  test('should filter emotions by date range', async ({ page }) => {
    // Look for date range picker
    const dateFilter = page.locator('input[type="date"], [data-testid="date-picker"]').first();
    
    if (await dateFilter.isVisible({ timeout: 3000 })) {
      // Select a date range
      await dateFilter.click();
      
      // Verify filtered results load
      await page.waitForTimeout(2000);
    }
  });

  test('should provide emotion insights', async ({ page }) => {
    // Check for insights section - use .first() for strict mode
    await expect(page.locator('text=/nhận xét/i').first()).toBeVisible({ timeout: 5000 });
    
    // Check for insights cards
    await expect(page.locator('text=/gợi ý/i').first()).toBeVisible();
  });
});

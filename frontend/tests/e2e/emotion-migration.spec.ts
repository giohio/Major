/**
 * Migration Verification E2E Tests
 * Tests emotion-related features after EmotionLog → ChatMessage migration
 * 
 * NOTE: These tests require backend running on port 5000 and seeded test data
 */

import { test, expect } from '@playwright/test';

test.describe('Emotion Migration Verification', () => {

    test.beforeEach(async ({ page }) => {
        // Login before each test  
        await page.goto('/login', { timeout: 60000 });
        await page.waitForLoadState('networkidle');

        // Use seeded test user credentials
        await page.locator('input[type="email"]').fill('user1@test.com');
        await page.locator('input[type="password"]').fill('User@123');
        await page.locator('form button[type="submit"]').first().click();

        // Wait for redirect after login
        await expect(page).toHaveURL(/.*dashboard|home|profile|user/i, { timeout: 15000 });
    });

    test('Emotion Dashboard loads with data', async ({ page }) => {
        await page.goto('/emotion');

        // Check page title
        await expect(page).toHaveTitle(/Emotion|Analytics|MindCare/);

        // Wait for data to load
        await page.waitForLoadState('networkidle');

        // Check for emotion stats section
        const statsSection = page.locator('[data-testid="emotion-stats"]');
        if (await statsSection.count() > 0) {
            await expect(statsSection).toBeVisible();
        }

        // Check for any text showing emotion data
        const hasEmotionText = await page.getByText(/emotion|cảm xúc|tổng số/i).count() > 0;
        expect(hasEmotionText).toBeTruthy();
    });

    test('Emotion stats API returns correct data', async ({ page, request }) => {
        // Get auth token from localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));

        if (!token) {
            test.skip();
            return;
        }

        // Test emotion stats endpoint
        const response = await request.get('http://127.0.0.1:5000/api/emotion/stats?period=week', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // Verify response structure
        expect(data).toHaveProperty('period');
        expect(data).toHaveProperty('total_logs');
        expect(data).toHaveProperty('emotion_distribution');
        expect(data).toHaveProperty('average_sentiment');
    });

    test('Emotion logs API returns ChatMessage data', async ({ page, request }) => {
        const token = await page.evaluate(() => localStorage.getItem('token'));

        if (!token) {
            test.skip();
            return;
        }

        const response = await request.get('http://127.0.0.1:5000/api/emotion/logs?page=1&per_page=10', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // Verify response structure (from ChatMessage, not EmotionLog)
        expect(data).toHaveProperty('logs');
        expect(data).toHaveProperty('total');

        if (data.logs.length > 0) {
            const log = data.logs[0];
            expect(log).toHaveProperty('emotion');
            expect(log).toHaveProperty('sentiment_score');
            expect(log).toHaveProperty('created_at');
        }
    });

    test('User stats shows emotion count', async ({ page, request }) => {
        const token = await page.evaluate(() => localStorage.getItem('token'));

        if (!token) {
            test.skip();
            return;
        }

        const response = await request.get('http://127.0.0.1:5000/api/users/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        expect(response.ok()).toBeTruthy();
        const data = await response.json();

        // Verify emotion count is present (from ChatMessage count, not EmotionLog)
        expect(data).toHaveProperty('total_emotion_logs');
        expect(typeof data.total_emotion_logs).toBe('number');
        expect(data.total_emotion_logs).toBeGreaterThanOrEqual(0);
    });

    test('No console errors on emotion pages', async ({ page }) => {
        const consoleErrors: string[] = [];

        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Navigate to emotion page
        await page.goto('/emotion');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Filter out known/acceptable errors
        const criticalErrors = consoleErrors.filter(err =>
            !err.includes('favicon') &&
            !err.includes('sourcemap') &&
            !err.includes('DevTools')
        );

        if (criticalErrors.length > 0) {
            console.log('Console errors found:', criticalErrors);
        }

        expect(criticalErrors.length).toBe(0);
    });
});

test.describe('API Integration Tests', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto('/login', { timeout: 60000 });
        await page.waitForLoadState('networkidle');

        await page.locator('input[type="email"]').fill('user1@test.com');
        await page.locator('input[type="password"]').fill('User@123');
        await page.locator('form button[type="submit"]').first().click();

        await expect(page).toHaveURL(/.*dashboard|home|profile|user/i, { timeout: 15000 });
    });

    test('API calls use correct endpoints after migration', async ({ page }) => {
        const apiCalls: string[] = [];

        // Track API calls
        page.on('request', request => {
            const url = request.url();
            if (url.includes('/api/')) {
                apiCalls.push(url);
            }
        });

        // Navigate to emotion page
        await page.goto('/emotion');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Check that emotion-related endpoints were called
        const emotionEndpoints = apiCalls.filter(url =>
            url.includes('/emotion/') || url.includes('/users/stats')
        );

        console.log('API calls made:', emotionEndpoints);

        // Should have made at least one emotion API call
        expect(emotionEndpoints.length).toBeGreaterThan(0);

        // Verify no calls to old EmotionLog endpoints (if any existed)
        const deprecatedCalls = apiCalls.filter(url =>
            url.includes('emotion_logs') || url.includes('emotionlogs')
        );
        expect(deprecatedCalls.length).toBe(0);
    });
});

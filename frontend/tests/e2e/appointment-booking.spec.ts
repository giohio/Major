import { test, expect, Page } from '@playwright/test';

// Mock authentication helper
async function mockAuth(page: Page) {
  // Set mock token in localStorage before navigating
  await page.addInitScript(() => {
    localStorage.setItem('access_token', 'mock-jwt-token-for-testing');
    localStorage.setItem('user', JSON.stringify({
      id: 1,
      email: 'testuser@test.com',
      full_name: 'Test User',
      role: 'user'
    }));
  });

  // Mock the /api/auth/me endpoint so AuthProvider recognizes the user
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        email: 'testuser@test.com',
        full_name: 'Test User',
        role: 'user'
      })
    });
  });
}

// Mock API responses for different plan types
const mockPlanLimits = {
  free: {
    plan_name: 'Free',
    features: {
      chat: { limit: 10, remaining: 10, unlimited: false },
      doctor_access: {
        enabled: false,
        message: "Your plan doesn't include doctor consultations. Please upgrade to Premium or VIP."
      },
      video: { enabled: false, message: 'Video consultations are not available in your plan. Please upgrade.' },
      appointments: { enabled: false, free_remaining: 0, has_discount: false }
    },
    subscription: { status: 'active' }
  },
  premium: {
    plan_name: 'Premium',
    features: {
      chat: { limit: -1, remaining: -1, unlimited: true },
      doctor_access: { enabled: true },
      video: { enabled: true },
      appointments: { enabled: true, free_remaining: 0, has_discount: false }
    },
    subscription: { status: 'active' }
  },
  vipWithFree: {
    plan_name: 'VIP',
    features: {
      chat: { limit: -1, remaining: -1, unlimited: true },
      doctor_access: { enabled: true },
      video: { enabled: true },
      appointments: { enabled: true, free_remaining: 2, has_discount: true, discount_percentage: 20 }
    },
    subscription: { status: 'active' }
  },
  vipNoFree: {
    plan_name: 'VIP',
    features: {
      chat: { limit: -1, remaining: -1, unlimited: true },
      doctor_access: { enabled: true },
      video: { enabled: true },
      appointments: { enabled: true, free_remaining: 0, has_discount: true, discount_percentage: 20 }
    },
    subscription: { status: 'active' }
  }
};

const mockDoctor = {
  id: 1,
  name: 'Dr. Nguyễn Văn A',
  specialty: 'Tâm lý học lâm sàng',
  experience: 10,
  rating: 4.8,
  reviews: 120,
  price: 500000,
  available: true,
  languages: ['Tiếng Việt', 'English'],
  image: 'https://via.placeholder.com/150',
  verified: true,
  bio: 'Chuyên gia tâm lý học'
};

async function setupMockAPIs(page: Page, planType: 'free' | 'premium' | 'vipWithFree' | 'vipNoFree') {
  // Mock plan limits API
  await page.route('**/api/plans/my-limits', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPlanLimits[planType])
    });
  });

  // Mock doctor info API
  await page.route('**/api/doctors/**', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockDoctor)
    });
  });
}

test.describe('Appointment Booking with Plan Limits', () => {
  
  test.describe('Free User - No Doctor Access', () => {
    test('should show upgrade modal immediately for Free user', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'free');
      
      // Navigate to booking page
      await page.goto('/user/book-appointment/1');
      
      // Wait for plan limits to load
      await page.waitForTimeout(500);
      
      // Upgrade modal should be visible
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Nâng cấp để mở khóa tính năng')).toBeVisible();
      
      // Check error message is displayed
      await expect(page.getByText(/doesn't include doctor consultations/i)).toBeVisible();
      
      // Check both Premium and VIP options are shown
      await expect(page.getByRole('heading', { name: 'Premium' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'VIP' })).toBeVisible();
      
      // Check Premium features
      await expect(page.getByText('💬 Chat AI không giới hạn')).toBeVisible();
      await expect(page.getByText('👨‍⚕️ Đặt lịch tư vấn bác sĩ')).toBeVisible();
      
      // Check VIP features
      await expect(page.getByText('🎁 2 buổi tư vấn MIỄN PHÍ/tháng')).toBeVisible();
      await expect(page.getByText('💎 Giảm 20% các buổi tư vấn thêm')).toBeVisible();
    });

    test('should navigate to pricing page when clicking upgrade', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'free');
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Click upgrade Premium button
      const upgradeButton = page.getByRole('button', { name: /Nâng cấp Premium/i });
      await upgradeButton.click();
      
      // Should navigate to pricing page
      await expect(page).toHaveURL(/\/plans/);
    });

    test('should not allow booking when closing modal', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'free');
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Close modal using "Để sau" button
      await page.getByRole('button', { name: /Để sau/i }).click();
      
      // Modal should be closed
      await expect(page.getByRole('dialog')).not.toBeVisible();
      
      // But booking form should still be disabled or show restrictions
      const bookButton = page.getByRole('button', { name: /Xác nhận đặt lịch/i });
      await expect(bookButton).toBeDisabled();
    });
  });

  test.describe('Premium User - Paid Appointments', () => {
    test('should show Premium badge and allow booking', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'premium');
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Should NOT show upgrade modal
      await expect(page.getByRole('dialog')).not.toBeVisible();
      
      // Should show Premium badge
      await expect(page.getByText('Gói Premium')).toBeVisible();
      await expect(page.getByText('Bạn có quyền đặt lịch tư vấn với bác sĩ')).toBeVisible();
      
      // Price should be normal (no discount)
      await expect(page.getByText('500.000 ₫')).toBeVisible();
      
      // Booking button should be enabled after selecting options
      const bookButton = page.getByRole('button', { name: /Xác nhận đặt lịch/i });
      await expect(bookButton).toBeDisabled(); // Initially disabled without selections
    });

    test('should redirect to payment URL when booking', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'premium');
      
      // Mock booking API with payment URL
      await page.route('**/api/users/appointments', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Appointment created',
            appointment: { id: 123, status: 'pending_payment' },
            payment_url: 'https://vnpay.vn/payment/123',
            amount: 500000,
            is_free: false,
            has_discount: false
          })
        });
      });
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Select consultation type
      await page.getByRole('button', { name: /Video Call/i }).click();
      
      // Select date (default is today)
      // Select time
      await page.getByRole('button', { name: '09:00' }).click();
      
      // Click book button
      const bookButton = page.getByRole('button', { name: /Xác nhận đặt lịch/i });
      await bookButton.click();
      
      // Should redirect to payment URL
      await page.waitForURL(/vnpay\.vn/, { timeout: 10000 });
      await expect(page.url()).toContain('vnpay.vn/payment');
    });

    test('should show upgrade modal if trying video without video access', async ({ page }) => {
      await mockAuth(page);
      
      // Mock plan limits with video disabled
      await page.route('**/api/plans/my-limits', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            ...mockPlanLimits.premium,
            features: {
              ...mockPlanLimits.premium.features,
              video: { enabled: false, message: 'Video not available' }
            }
          })
        });
      });
      
      await page.route('**/api/doctors/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDoctor)
        });
      });
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Select video consultation
      await page.getByRole('button', { name: /Video Call/i }).click();
      await page.getByRole('button', { name: '09:00' }).click();
      
      // Try to book
      await page.getByRole('button', { name: /Xác nhận đặt lịch/i }).click();
      
      // Should show upgrade modal
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText(/Video not available/i)).toBeVisible();
    });
  });

  test.describe('VIP User - Free Sessions Available', () => {
    test('should show VIP benefits badge with free sessions', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'vipWithFree');
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Should show VIP badge with benefits
      await expect(page.getByText('Đặc quyền VIP')).toBeVisible();
      await expect(page.getByText('Còn 2 buổi MIỄN PHÍ trong tháng')).toBeVisible();
      await expect(page.getByText('Giảm 20% cho các buổi tư vấn thêm')).toBeVisible();
      
      // Price should show FREE
      await expect(page.getByText('MIỄN PHÍ', { exact: true })).toBeVisible();
      await expect(page.getByText('500.000 ₫').first()).toHaveClass(/line-through/);
      
      // Button text should be different
      await expect(page.getByRole('button', { name: /Đặt lịch miễn phí/i })).toBeVisible();
    });

    test('should book free session successfully', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'vipWithFree');
      
      // Mock booking API for free session
      await page.route('**/api/users/appointments', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Free appointment booked!',
            appointment: { id: 123, status: 'pending' },
            is_free: true,
            free_sessions_remaining: 1
          })
        });
      });
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Select options
      await page.getByRole('button', { name: /Video Call/i }).click();
      await page.getByRole('button', { name: '09:00' }).click();
      
      // Click book button
      await page.getByRole('button', { name: /Đặt lịch miễn phí/i }).click();
      
      // Should navigate to appointments page after booking
      await page.waitForURL('/user/appointments', { timeout: 10000 });
      
      // Verify success (page navigated)
      await expect(page).toHaveURL('/user/appointments');
    });
  });

  test.describe('VIP User - No Free Sessions (20% Discount)', () => {
    test('should show VIP discount pricing', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'vipNoFree');
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Should show VIP badge but no free sessions
      await expect(page.getByText('Đặc quyền VIP')).toBeVisible();
      await expect(page.getByText('Giảm 20% cho các buổi tư vấn thêm')).toBeVisible();
      
      // Should NOT show free sessions text
      await expect(page.getByText(/Còn.*buổi MIỄN PHÍ/i)).not.toBeVisible();
      
      // Should show original price crossed out
      await expect(page.getByText('Giá gốc')).toBeVisible();
      await expect(page.locator('text=500.000 ₫').first()).toHaveClass(/line-through/);
      
      // Should show discounted price
      await expect(page.getByText('Giá VIP (-20%)')).toBeVisible();
      await expect(page.getByText('400.000 ₫')).toBeVisible();
      
      // Button should be normal booking button
      await expect(page.getByRole('button', { name: /Xác nhận đặt lịch/i })).toBeVisible();
    });

    test('should redirect to payment with discounted amount', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'vipNoFree');
      
      // Mock booking API with discounted payment
      await page.route('**/api/users/appointments', async route => {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            message: 'Appointment created',
            appointment: { id: 123, status: 'pending_payment' },
            payment_url: 'https://vnpay.vn/payment/123',
            amount: 400000, // 20% discount
            is_free: false,
            has_discount: true
          })
        });
      });
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Select options and book
      await page.getByRole('button', { name: /Video Call/i }).click();
      await page.getByRole('button', { name: '09:00' }).click();
      await page.getByRole('button', { name: /Xác nhận đặt lịch/i }).click();
      
      // Should redirect to payment URL
      await page.waitForURL(/vnpay\.vn/, { timeout: 10000 });
      await expect(page.url()).toContain('vnpay.vn/payment');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle API error with upgrade_required flag', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'premium');
      
      // Mock booking API with upgrade required error
      await page.route('**/api/users/appointments', async route => {
        await route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Feature not available',
            message: 'Your plan does not include this feature',
            upgrade_required: true,
            current_plan: 'Premium'
          })
        });
      });
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Try to book
      await page.getByRole('button', { name: /Video Call/i }).click();
      await page.getByRole('button', { name: '09:00' }).click();
      await page.getByRole('button', { name: /Xác nhận đặt lịch/i }).click();
      
      // Should show upgrade modal instead of generic error
      await expect(page.getByRole('dialog')).toBeVisible();
      await expect(page.getByText('Nâng cấp để mở khóa tính năng')).toBeVisible();
    });

    test.skip('should handle network errors gracefully', async ({ page }) => {
      
      
      // Mock plan limits to fail
      await page.route('**/api/plans/my-limits', async route => {
        await route.abort('failed');
      });
      
      await page.route('**/api/doctors/**', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockDoctor)
        });
      });
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(1000);
      
      // Page should still load and not crash
      await expect(page.locator('body')).toBeVisible();
      
      // Check some basic element exists
      await expect(page.getByText(/Hình thức|Thời gian|Bác sĩ/)).toBeVisible();
    });
  });

  test.describe('UI/UX Flow', () => {
    test.skip('should complete full booking flow step by step', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'premium');
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      // Step 1: Select consultation type
      await expect(page.getByText('Hình thức tư vấn')).toBeVisible();
      const videoButton = page.getByRole('button', { name: /Video Call/i });
      await expect(videoButton).toBeVisible();
      await videoButton.click();
      
      // Step 2: Select date and time
      await expect(page.getByRole('heading', { name: 'Thời gian' })).toBeVisible();
      await page.getByRole('button', { name: '09:00' }).click();
      
      // Step 3: Add notes (optional)
      await expect(page.getByText('Thông tin bổ sung')).toBeVisible();
      await page.getByPlaceholder('Mô tả ngắn gọn vấn đề của bạn').fill('Test booking notes');
      
      // Verify summary card shows selections
      await expect(page.getByText('Video Call')).toBeVisible();
      await expect(page.getByText('09:00')).toBeVisible();
      
      // Book button should be enabled now
      const bookButton = page.getByRole('button', { name: /Xác nhận đặt lịch/i });
      await expect(bookButton).toBeEnabled();
    });

    test('should disable book button until all required fields selected', async ({ page }) => {
      await mockAuth(page);
      await setupMockAPIs(page, 'premium');
      
      await page.goto('/user/book-appointment/1');
      await page.waitForTimeout(500);
      
      const bookButton = page.getByRole('button', { name: /Xác nhận đặt lịch/i });
      
      // Initially disabled
      await expect(bookButton).toBeDisabled();
      
      // Select type only
      await page.getByRole('button', { name: /Video Call/i }).click();
      await expect(bookButton).toBeDisabled();
      
      // Select time
      await page.getByRole('button', { name: '09:00' }).click();
      
      // Now should be enabled (date has default value)
      await expect(bookButton).toBeEnabled();
    });
  });
});



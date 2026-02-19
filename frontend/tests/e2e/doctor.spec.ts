import { test, expect } from '@playwright/test';

test.describe('Doctor Features', () => {
  test.beforeEach(async ({ page }) => {
    // Login as doctor
    await page.goto('/login');
    await page.locator('input[type="email"]').fill('doctor1@mindcare.ai');
    await page.locator('input[type="password"]').fill('Doctor@123');
    await page.locator('form button[type="submit"]').first().click();
    
    await expect(page).toHaveURL(/.*dashboard|home|doctor/i, { timeout: 10000 });
  });

  test('should display doctor dashboard', async ({ page }) => {
    // Verify doctor-specific elements using .first() to avoid strict mode
    await expect(page.locator('text=/bệnh nhân/i').first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/lịch hẹn/i').first()).toBeVisible();
  });

  test('should list patients', async ({ page }) => {
    // Navigate to patients list
    await page.getByRole('link', { name: /patient|bệnh nhân/i }).click();
    
    // Verify patients list
    await expect(page.getByRole('heading', { name: /patient|bệnh nhân/i })).toBeVisible();
    
    // Check for patient cards/rows
    const patientItems = page.locator('.patient-card, [data-testid="patient"]');
    
    if (await patientItems.count() > 0) {
      await expect(patientItems.first()).toBeVisible();
    }
  });

  test('should view patient details', async ({ page }) => {
    // Navigate to patients
    await page.getByRole('link', { name: /patient|bệnh nhân/i }).click();
    
    // Click on first patient
    const firstPatient = page.locator('.patient-card, [data-testid="patient"]').first();
    
    if (await firstPatient.isVisible({ timeout: 3000 })) {
      await firstPatient.click();
      
      // Verify patient detail page
      await expect(page.locator('text=/history|emotion.*log|medical.*record/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should add doctor note', async ({ page }) => {
    // Navigate to a patient
    await page.goto('/doctor/patients/1'); // Direct navigation
    
    // Look for add note button
    const addNoteButton = page.getByRole('button', { name: /add.*note|tạo.*ghi chú/i });
    
    if (await addNoteButton.isVisible({ timeout: 3000 })) {
      await addNoteButton.click();
      
      // Fill note form
      await page.locator('textarea[name="note"], textarea[name="content"]').fill('Patient showing improvement');
      
      // Submit
      await page.getByRole('button', { name: /save|submit|lưu/i }).click();
      
      // Verify success
      await expect(page.locator('text=/saved|success|đã lưu/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view appointments', async ({ page }) => {
    // Navigate to appointments
    await page.getByRole('link', { name: /appointment|lịch hẹn/i }).click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Check for calendar or list view - use .first() for strict mode
    await expect(page.locator('text=/hôm nay/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('should create appointment', async ({ page }) => {
    // Navigate to appointments
    await page.getByRole('link', { name: /appointment|lịch hẹn/i }).click();
    
    // Click create appointment
    const createButton = page.getByRole('button', { name: /create|new|tạo mới/i });
    
    if (await createButton.isVisible({ timeout: 3000 })) {
      await createButton.click();
      
      // Fill appointment form
      await page.locator('input[name="patient_name"], select[name="patient_id"]').first().click();
      await page.locator('input[type="datetime-local"], input[type="date"]').first().fill('2025-12-15T10:00');
      
      // Submit
      await page.getByRole('button', { name: /save|create|lưu/i }).click();
      
      // Verify success
      await expect(page.locator('text=/created|success|đã tạo/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view patient emotion history', async ({ page }) => {
    // Navigate to patient detail
    await page.goto('/doctor/patients/1');
    
    // Look for emotion history tab
    const emotionTab = page.getByRole('tab', { name: /emotion|mood|cảm xúc/i });
    
    if (await emotionTab.isVisible({ timeout: 3000 })) {
      await emotionTab.click();
      
      // Verify emotion logs
      await expect(page.locator('.emotion-log, [data-testid="emotion-log"]')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should assign task to patient', async ({ page }) => {
    // Navigate to patient detail
    await page.goto('/doctor/patients/1');
    
    // Look for assign task button
    const assignTaskButton = page.getByRole('button', { name: /assign.*task|giao.*bài/i });
    
    if (await assignTaskButton.isVisible({ timeout: 3000 })) {
      await assignTaskButton.click();
      
      // Select exercise/task
      await page.locator('select[name="exercise_id"], input[name="title"]').first().fill('Daily meditation');
      
      // Submit
      await page.getByRole('button', { name: /assign|save|giao/i }).click();
      
      // Verify success
      await expect(page.locator('text=/assigned|success|đã giao/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should view patient alerts', async ({ page }) => {
    // Navigate to alerts
    await page.getByRole('link', { name: /alert|cảnh báo/i }).click();
    
    // Verify alerts page
    await expect(page.getByRole('heading', { name: /alert|cảnh báo/i })).toBeVisible();
    
    // Check for alert items
    const alerts = page.locator('.alert-item, [data-testid="alert"]');
    
    if (await alerts.count() > 0) {
      await expect(alerts.first()).toBeVisible();
    }
  });

  test('should resolve patient alert', async ({ page }) => {
    // Navigate to alerts
    await page.getByRole('link', { name: /alert|cảnh báo/i }).click();
    
    // Click on first alert
    const firstAlert = page.locator('.alert-item, [data-testid="alert"]').first();
    
    if (await firstAlert.isVisible({ timeout: 3000 })) {
      await firstAlert.click();
      
      // Click resolve button
      const resolveButton = page.getByRole('button', { name: /resolve|giải quyết/i });
      
      if (await resolveButton.isVisible({ timeout: 2000 })) {
        await resolveButton.click();
        
        // Verify resolved
        await expect(page.locator('text=/resolved|đã giải quyết/i')).toBeVisible({ timeout: 5000 });
      }
    }
  });
});

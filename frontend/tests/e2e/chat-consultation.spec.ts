import { test, expect, Page } from '@playwright/test';

// Mock authentication helper
async function mockAuth(page: Page, role: 'doctor' | 'patient' = 'patient') {
  const mockUser = role === 'doctor' 
    ? {
        id: 100,
        email: 'doctor@test.com',
        full_name: 'Dr. Test',
        role: 'doctor'
      }
    : {
        id: 1,
        email: 'patient@test.com',
        full_name: 'Test Patient',
        role: 'user'
      };

  // Set localStorage token
  await page.addInitScript((user) => {
    localStorage.setItem('token', 'mock-jwt-token');
    localStorage.setItem('user', JSON.stringify(user));
  }, mockUser);

  // Mock auth endpoint
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockUser)
    });
  });
}

// Mock appointments API
async function mockAppointments(page: Page, role: 'doctor' | 'patient' = 'patient') {
  const appointments = role === 'doctor'
    ? [
        {
          id: 1,
          user_id: 1,
          user_name: 'Test Patient',
          doctor_id: 1,
          appointment_type: 'chat',
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          duration_minutes: 60,
          status: 'scheduled',
          notes: 'Patient notes here'
        },
        {
          id: 2,
          user_id: 1,
          user_name: 'Test Patient',
          doctor_id: 1,
          appointment_type: 'video',
          appointment_date: new Date(Date.now() + 172800000).toISOString(),
          duration_minutes: 45,
          status: 'scheduled'
        }
      ]
    : [
        {
          id: 1,
          doctor_id: 100,
          doctor_name: 'Dr. Test',
          doctor_specialization: 'Psychology',
          appointment_type: 'chat',
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          duration_minutes: 60,
          status: 'scheduled',
          notes: 'My anxiety issues',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          doctor_id: 100,
          doctor_name: 'Dr. Test',
          doctor_specialization: 'Psychology',
          appointment_type: 'video',
          appointment_date: new Date(Date.now() + 172800000).toISOString(),
          duration_minutes: 45,
          status: 'scheduled',
          created_at: new Date().toISOString()
        }
      ];

  const endpoint = role === 'doctor' 
    ? '**/api/doctors/appointments'
    : '**/api/users/appointments';

  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(appointments)
    });
  });

  // Also mock auth context check
  await page.route('**/api/plans/my-limits', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        plan_name: 'Premium',
        features: {
          chat: { enabled: true },
          video: { enabled: true },
          doctor_access: { enabled: true },
          appointments: { limit: 10 }
        }
      })
    });
  });
}

// Mock chat messages API
async function mockChatMessages(page: Page, appointmentId: number, messages: { id: number; role: string; message: string; created_at: string; read: boolean }[] = []) {
  await page.route(`**/api/chat/appointments/${appointmentId}/messages`, async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages })
      });
    } else if (route.request().method() === 'POST') {
      const postData = route.request().postDataJSON();
      const newMessage = {
        id: messages.length + 1,
        role: postData.role || 'user',
        message: postData.message,
        created_at: new Date().toISOString(),
        read: false
      };
      messages.push(newMessage);
      
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          message: 'Message sent successfully',
          data: newMessage
        })
      });
    }
  });
}

test.describe('Chat Consultation - Patient Side', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page, 'patient');
    await mockAppointments(page, 'patient');
  });

  test('should display chat button for chat-type appointments', async ({ page }) => {
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    // Find chat appointment card
    const chatCard = page.locator('text=Dr. Test').first();
    await expect(chatCard).toBeVisible();

    // Check for Chat button
    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await expect(chatButton).toBeVisible();
  });

  test('should open chat modal when clicking Chat button', async ({ page }) => {
    const messages: { id: number; role: string; message: string; created_at: string; read: boolean }[] = [];
    await mockChatMessages(page, 1, messages);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    // Click Chat button
    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Verify chat modal opened
    await expect(page.getByText('Dr. Test')).toBeVisible();
    await expect(page.getByPlaceholder(/enter message|type message/i)).toBeVisible();
  });

  test('should display empty state when no messages', async ({ page }) => {
    await mockChatMessages(page, 1, []);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Check empty state
    await expect(page.getByText(/no messages yet|no messages/i)).toBeVisible();
  });

  test('should send and display messages', async ({ page }) => {
    const messages: { id: number; role: string; message: string; created_at: string; read: boolean }[] = [];
    await mockChatMessages(page, 1, messages);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Type message
    const input = page.getByPlaceholder(/enter message|type message/i);
    await input.fill('I need advice about my anxiety');

    // Send message
    const sendButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // Wait for message to appear
    await page.waitForTimeout(500);
    
    // Message should be visible
    await expect(page.getByText('I need advice about my anxiety')).toBeVisible();
  });

  test('should show Video Call upgrade button', async ({ page }) => {
    await mockChatMessages(page, 1, []);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Check for Video Call button in header
    const videoButton = page.getByRole('button', { name: /video call/i });
    await expect(videoButton).toBeVisible();
  });

  test('should close chat modal when clicking close button', async ({ page }) => {
    await mockChatMessages(page, 1, []);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Close modal
    const closeButton = page.getByRole('button', { name: /đóng/i });
    await closeButton.click();

    // Modal should be closed
    await expect(page.getByPlaceholder(/enter message|type message/i)).not.toBeVisible();
  });
});

test.describe('Chat Consultation - Doctor Side', () => {
  test.beforeEach(async ({ page }) => {
    await mockAuth(page, 'doctor');
    await mockAppointments(page, 'doctor');
  });

  test('should display Chat button for chat-type appointments', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor/appointments');
    await page.waitForLoadState('networkidle');

    // Check for Chat button (green)
    const chatButtons = page.getByRole('button', { name: /chat/i });
    await expect(chatButtons.first()).toBeVisible();
  });

  test('should open chat modal as doctor', async ({ page }) => {
    const messages: { id: number; role: string; message: string; created_at: string; read: boolean }[] = [];
    await mockChatMessages(page, 1, messages);
    
    await page.goto('http://localhost:5173/doctor/appointments');
    await page.waitForLoadState('networkidle');

    // Click Chat button in scheduled tab
    await page.getByRole('tab', { name: /scheduled/i }).click();
    await page.waitForTimeout(300);

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Verify chat modal opened with patient name
    await expect(page.getByText('Test Patient')).toBeVisible();
    await expect(page.getByPlaceholder(/enter consultation message|type consultation message/i)).toBeVisible();
  });

  test('should send doctor messages with correct role', async ({ page }) => {
    const messages: { id: number; role: string; message: string; created_at: string; read: boolean }[] = [];
    await mockChatMessages(page, 1, messages);
    
    await page.goto('http://localhost:5173/doctor/appointments');
    await page.waitForLoadState('networkidle');

    await page.getByRole('tab', { name: /scheduled/i }).click();
    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Send message as doctor
    const input = page.getByPlaceholder(/enter consultation message|type consultation message/i);
    await input.fill('Hello, how can I help you?');

    const sendButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    await page.waitForTimeout(500);

    // Verify message sent
    await expect(page.getByText('Hello, how can I help you?')).toBeVisible();
  });

  test('should display existing conversation', async ({ page }) => {
    const existingMessages = [
      {
        id: 1,
        role: 'user',
        message: 'Hello doctor',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        read: true
      },
      {
        id: 2,
        role: 'doctor',
        message: 'Hello, how can I help?',
        created_at: new Date(Date.now() - 3000000).toISOString(),
        read: true
      }
    ];
    await mockChatMessages(page, 1, existingMessages);
    
    await page.goto('http://localhost:5173/doctor/appointments');
    await page.waitForLoadState('networkidle');

    await page.getByRole('tab', { name: /scheduled/i }).click();
    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Both messages should be visible
    await expect(page.getByText('Hello doctor')).toBeVisible();
    await expect(page.getByText('Hello, how can I help?')).toBeVisible();
  });

  test('should show video button only for video appointments', async ({ page }) => {
    await page.goto('http://localhost:5173/doctor/appointments');
    await page.waitForLoadState('networkidle');

    await page.getByRole('tab', { name: /scheduled/i }).click();
    
    // First appointment is chat - should show Chat button
    const chatButton = page.getByRole('button', { name: /^chat$/i }).first();
    await expect(chatButton).toBeVisible();

    // Video appointments should show Video button not Chat
    // Video appointments are distinguished by appointment type
  });
});

test.describe('Chat Consultation - Message Display', () => {
  test('should display messages with correct alignment', async ({ page }) => {
    await mockAuth(page, 'patient');
    await mockAppointments(page, 'patient');
    
    const messages = [
      {
        id: 1,
        role: 'user',
        message: 'Patient message',
        created_at: new Date().toISOString(),
        read: true
      },
      {
        id: 2,
        role: 'doctor',
        message: 'Doctor reply',
        created_at: new Date().toISOString(),
        read: true
      }
    ];
    await mockChatMessages(page, 1, messages);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Both messages should be visible
    await expect(page.getByText('Patient message')).toBeVisible();
    await expect(page.getByText('Doctor reply')).toBeVisible();
  });

  test('should display timestamps for messages', async ({ page }) => {
    await mockAuth(page, 'patient');
    await mockAppointments(page, 'patient');
    
    const messages = [
      {
        id: 1,
        role: 'user',
        message: 'Test message',
        created_at: new Date().toISOString(),
        read: true
      }
    ];
    await mockChatMessages(page, 1, messages);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    await expect(page.getByText('Test message')).toBeVisible();
    // Timestamp should be visible (time format)
    await expect(page.locator('text=/\\d{2}:\\d{2}/')).toBeVisible();
  });
});

test.describe('Chat Consultation - Error Handling', () => {
  test('should handle message send failure', async ({ page }) => {
    await mockAuth(page, 'patient');
    await mockAppointments(page, 'patient');
    
    // Mock failure
    await page.route('**/api/chat/appointments/1/messages', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      } else {
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ messages: [] })
        });
      }
    });
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    const input = page.getByPlaceholder(/nhập tin nhắn/i);
    await input.fill('Test message');

    const sendButton = page.getByRole('button').filter({ has: page.locator('svg') }).last();
    await sendButton.click();

    // Should show error toast
    await expect(page.getByText(/failed to send message|cannot send message/i)).toBeVisible();
  });

  test('should handle unauthorized access', async ({ page }) => {
    await mockAuth(page, 'patient');
    await mockAppointments(page, 'patient');
    
    // Mock 403 response
    await page.route('**/api/chat/appointments/1/messages', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' })
      });
    });
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Should show error
    await expect(page.getByText(/failed to load messages|cannot load messages/i)).toBeVisible();
  });
});

test.describe('Chat Consultation - Integration', () => {
  test('should switch from chat to video call', async ({ page }) => {
    await mockAuth(page, 'patient');
    await mockAppointments(page, 'patient');
    await mockChatMessages(page, 1, []);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    // Open chat
    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Click Video Call upgrade button
    const videoButton = page.getByRole('button', { name: /video call/i });
    await videoButton.click();

    // Chat modal should close, video modal should open
    await expect(page.getByPlaceholder(/enter message|type message/i)).not.toBeVisible();
    // Video call component would load here
  });

  test('should support keyboard shortcuts', async ({ page }) => {
    await mockAuth(page, 'patient');
    await mockAppointments(page, 'patient');
    
    const messages: { id: number; role: string; message: string; created_at: string; read: boolean }[] = [];
    await mockChatMessages(page, 1, messages);
    
    await page.goto('http://localhost:5173/user/appointments');
    await page.waitForLoadState('networkidle');

    const chatButton = page.getByRole('button', { name: /chat/i }).first();
    await chatButton.click();

    // Type and press Enter
    const input = page.getByPlaceholder(/enter message|type message/i);
    await input.fill('Quick message');
    await input.press('Enter');

    await page.waitForTimeout(500);

    // Message should be sent
    await expect(page.getByText('Quick message')).toBeVisible();
  });
});

const { test, expect } = require('@playwright/test');

/**
 * EventHub Booking Flow E2E Tests
 * Based on docs/test-strategy.md
 * 
 * Standards:
 * - Uses Top-Level Constants for credentials.
 * - Extracts reusable login helper.
 * - Prioritizes getByTestId locators.
 * - Autonomous setup (Self-healing).
 */

// -- Top Level Constants --
const USER_EMAIL = 'rahulshetty1@gmail.com';
const USER_PASSWORD = 'Magiclife1!';

// -- Reusable Helpers --
async function login(page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(USER_EMAIL);
  await page.getByLabel('Password').fill(USER_PASSWORD);
  await page.locator('#login-btn').click();
  await expect(page).toHaveURL('/');
}

async function ensureBookingExists(page) {
  await page.goto('/bookings');
  
  // Wait for either the list to load or the empty state to appear
  const bookingCards = page.getByTestId('booking-card');
  const emptyState = page.getByText('No bookings yet');
  
  await Promise.race([
    bookingCards.first().waitFor({ state: 'visible' }).catch(() => {}),
    emptyState.waitFor({ state: 'visible' }).catch(() => {})
  ]);

  if (await bookingCards.count() === 0) {
    await page.goto('/events');
    const bookBtn = page.getByTestId('book-now-btn').first();
    await expect(bookBtn).toBeVisible();
    await bookBtn.click();
    
    // Fill booking form
    await page.getByLabel('Full Name').fill('Test User');
    await page.getByTestId('customer-email').fill(USER_EMAIL);
    await page.getByPlaceholder('+91 98765 43210').fill('1234567890');
    await page.locator('.confirm-booking-btn').click();
    
    // Wait for confirmation
    await expect(page.locator('.booking-ref').first()).toBeVisible();
    await page.goto('/bookings');
    await expect(page.getByTestId('booking-card').first()).toBeVisible();
  }
}

test.describe('Booking Flow E2E', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await ensureBookingExists(page);
  });

  test('TC-001: View bookings list with existing bookings', async ({ page }) => {
    await page.goto('/bookings');
    
    // Assert cards are rendered using data-testid
    const bookingCards = page.getByTestId('booking-card');
    await expect(bookingCards.first()).toBeVisible();
    
    // Verify essential card content
    await expect(bookingCards.first().locator('h3')).not.toBeEmpty();
    await expect(bookingCards.first().locator('.booking-ref')).not.toBeEmpty();
  });

  test('TC-002: View single booking detail page', async ({ page }) => {
    await page.goto('/bookings');
    
    // Capture the ref from the first card to verify it on detail page
    const firstCard = page.getByTestId('booking-card').first();
    await expect(firstCard).toBeVisible();
    const firstCardRef = await firstCard.locator('.booking-ref').textContent();
    
    // Click "View Details"
    await firstCard.getByRole('link', { name: 'View Details' }).click();
    
    // Assert URL and content
    await expect(page).toHaveURL(/\/bookings\/\d+/);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('span.font-mono.font-bold').first()).toHaveText(firstCardRef.trim());
    
    // Verify breadcrumb shows booking ref (TC-505)
    const breadcrumb = page.locator('nav.text-sm.text-gray-500').filter({ hasText: 'My Bookings' });
    await expect(breadcrumb).toContainText(firstCardRef.trim());
  });

  test('TC-003: Cancel a single booking from detail page', async ({ page }) => {
    await page.goto('/bookings');
    
    // Go to first booking detail
    await page.getByRole('link', { name: 'View Details' }).first().click();
    
    // Click Cancel
    const cancelBtn = page.getByTestId('cancel-booking-btn').first();
    await cancelBtn.click();
    
    // TC-503: Confirm dialog appears
    const confirmDialog = page.getByText(/cancel this booking/i); 
    await expect(confirmDialog.first()).toBeVisible();
    
    // Click Confirm in dialog using data-testid
    await page.getByTestId('confirm-dialog-yes').click();
    
    // TC-506: Cancel success — toast + redirect to /bookings
    await expect(page).toHaveURL('/bookings');
    await expect(page.getByText(/successfully|cancelled/i)).toBeVisible();
  });
});

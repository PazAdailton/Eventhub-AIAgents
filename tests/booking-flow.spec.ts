import { test, expect, Page } from '@playwright/test';

const BASE_URL      = 'https://eventhub.rahulshettyacademy.com';

// ── Credentials ────────────────────────────────────────────────────────────────
// Change these to match a registered account in your local sandbox
const USER_EMAIL    = 'rahulshetty1@gmail.com';
const USER_PASSWORD = '123456';

// ── Helpers ────────────────────────────────────────────────────────────────────
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);

  // Located by label
  await page.getByPlaceholder('you@email.com').fill(USER_EMAIL);

  // Located by label
  await page.getByLabel('Password').fill(USER_PASSWORD);

  // Located by id
  await page.locator('#login-btn').click();

  // Wait until redirected away from /login
  await expect(page).not.toHaveURL(/\/login/);
}


// ── Test ───────────────────────────────────────────────────────────────────────
test('book an event and verify order + seat reduction', async ({ page }) => {

  // ── Step 1: Log in ───────────────────────────────────────────────────────
  await login(page);

  // ── Step 2: Go to Events page and capture seat count ────────────────────
  await page.goto(`${BASE_URL}/events`);

  // Located by data-testid
  const eventCards = page.getByTestId('event-card');
  await expect(eventCards.first()).toBeVisible();

  // Use the first event card directly
  const targetCard = eventCards.first();

  // Store event title and seat count before booking
  const eventTitle         = await targetCard.locator('h3').innerText();
  const seatsBeforeBooking = parseInt(await targetCard.locator('text=/\\d+ seat/').first().innerText());

  console.log(`Booking event: "${eventTitle}" | Seats before: ${seatsBeforeBooking}`);

  // Located by data-testid
  await targetCard.getByTestId('book-now-btn').click();
  await expect(page).toHaveURL(/\/events\/\d+/);

  // ── Step 3: Fill the booking form ────────────────────────────────────────

  // Quantity defaults to 1 — verify via id
  const ticketCount = page.locator('#ticket-count');
  await expect(ticketCount).toHaveText('1');

  // Located by label
  await page.getByLabel('Full Name').fill('Test Student');

  // Located by id
  await page.locator('#customer-email').fill('test.student@example.com');

  // Located by placeholder
  await page.getByPlaceholder('+91 98765 43210').fill('9876543210');

  // Located by CSS class
  await page.locator('.confirm-booking-btn').click();

  // ── Step 4: Verify booking confirmation ──────────────────────────────────

  // Located by CSS class
  const bookingRefEl = page.locator('.booking-ref').first();
  await expect(bookingRefEl).toBeVisible();

  const bookingRef = (await bookingRefEl.innerText()).trim();
  expect(bookingRef).toMatch(/^BK-/);

  console.log(`Booking confirmed. Ref: ${bookingRef}`);

  // ── Step 5: Verify booking appears in My Bookings ────────────────────────
  await page.getByRole('link', { name: 'View My Bookings' }).click();
  await expect(page).toHaveURL('/bookings');

  // Located by id
  const bookingCards  = page.locator('#booking-card');
  await expect(bookingCards.first()).toBeVisible();

  // Find the card that contains our booking ref (via CSS class inside the card)
  const matchingCard = bookingCards.filter({ has: page.locator('.booking-ref', { hasText: bookingRef }) });
  await expect(matchingCard).toBeVisible();

  // Verify event title also appears in the same card
  await expect(matchingCard).toContainText(eventTitle);

  console.log(`Booking card found in My Bookings for ref: ${bookingRef}`);

  // ── Step 6: Verify seat count reduced on Events page ─────────────────────
  await page.goto(`${BASE_URL}/events`);
  await expect(eventCards.first()).toBeVisible();

  // Find the same event by title
  const updatedCard       = eventCards.filter({ hasText: eventTitle }).first();
  await expect(updatedCard).toBeVisible();

  const seatsAfterBooking  = parseInt(await updatedCard.locator('text=/\\d+ seat/').first().innerText());

  console.log(`Seats after booking: ${seatsAfterBooking}`);

  // Booked 1 ticket — count must drop by exactly 1
  expect(seatsAfterBooking).toBe(seatsBeforeBooking - 1);
});

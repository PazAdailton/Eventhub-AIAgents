const { test, expect } = require('@playwright/test');

const BASE_URL   = 'https://eventhub.rahulshettyacademy.com';
const API_BASE   = `${BASE_URL}/api`;
const YAHOO_USER = { email: 'rahulshetty1@yahoo.com', password: '123456' };
const GMAIL_USER = { email: 'rahulshetty1@gmail.com', password: '123456' };

class ApiUtils {
    constructor(apiContext, loginPayLoad) {
        this.apiContext = apiContext;
        this.loginPayLoad = loginPayLoad;
    }

    async getToken() {
        const loginResponse = await this.apiContext.post(`${API_BASE}/auth/login`, {
            data: this.loginPayLoad
        });
        const loginResponseJson = await loginResponse.json();
        const token = loginResponseJson.token;
        console.log(token);
        return token;
    }

    async createBooking(bookingPayLoad) {
        let response = {};
        response.token = await this.getToken();

        const eventsResponse = await this.apiContext.get(`${API_BASE}/events?limit=1`, {
            headers: { 'Authorization': `Bearer ${response.token}` }
        });
        const eventsResponseJson = await eventsResponse.json();
        console.log(eventsResponseJson);
        const eventId = eventsResponseJson.data[0].id;

        const bookingResponse = await this.apiContext.post(`${API_BASE}/bookings`, {
            data: { ...bookingPayLoad, eventId },
            headers: {
                'Authorization': `Bearer ${response.token}`,
                'Content-Type': 'application/json'
            }
        });
        const bookingResponseJson = await bookingResponse.json();
        console.log(bookingResponseJson);
        response.bookingId = bookingResponseJson.data.id;

        return response;
    }
}

test('gmail user sees Access Denied when viewing yahoo user booking', async ({ page, request }) => {

    // ── Step 1: Login as Yahoo user and create booking via ApiUtils ───────────
    const apiUtils = new ApiUtils(request, YAHOO_USER);

    const bookingPayLoad = {
        customerName:  'Yahoo User',
        customerEmail: YAHOO_USER.email,
        customerPhone: '9999999999',
        quantity:      1,
    };

    const yahooResponse = await apiUtils.createBooking(bookingPayLoad);
    const yahooBookingId = yahooResponse.bookingId;
    console.log(`Yahoo booking ID to cross-access: ${yahooBookingId}`);

    // ── Step 2: Login as Gmail user in browser ────────────────────────────────
    await page.goto(`${BASE_URL}/login`);
    await page.getByPlaceholder('you@email.com').fill(GMAIL_USER.email);
    await page.getByLabel('Password').fill(GMAIL_USER.password);
    await page.locator('#login-btn').click();
    await expect(page).not.toHaveURL(/\/login/);

    // ── Step 3: Mock the bookings list to inject Yahoo's booking ID ───────────
    await page.route(/\/api\/bookings(\?|$)/, route => route.fulfill({
        status:      200,
        contentType: 'application/json',
        body:        JSON.stringify({
            data: [{ id: yahooBookingId, bookingRef: 'EVT-YAHOO1', customerName: 'Yahoo User', customerEmail: YAHOO_USER.email, customerPhone: '9999999999', quantity: 1, totalPrice: 500, status: 'confirmed', createdAt: '2025-06-01T10:00:00.000Z', event: { title: 'Test Event', category: 'Conference', eventDate: '2025-06-01T10:00:00.000Z', venue: 'Test Venue', city: 'Bangalore', price: '500' } }],
            pagination: { page: 1, totalPages: 1, total: 1, limit: 10 },
        }),
    }));

    await page.goto(`${BASE_URL}/bookings`);
    await expect(page.locator('#booking-card').first()).toBeVisible();

    // ── Step 4: Click View Details → real API fires with Gmail token + Yahoo ID
    await page.getByRole('link', { name: 'View Details' }).first().click();
    await expect(page).toHaveURL(new RegExp(`/bookings/${yahooBookingId}`));

    // ── Step 5: Validate Access Denied message ────────────────────────────────
    await expect(page.getByText('Access Denied')).toBeVisible();
    await expect(page.getByText('You are not authorized to view this booking')).toBeVisible();
});

# Test Scenarios: Booking Management

### TC-001: Successful Ticket Purchase
**Category**: Happy Path
**Priority**: P0
**Preconditions**: User is logged in, event has at least 1 available seat.
**Steps**:
1. Navigate to the Event Details page.
2. Select 1 ticket.
3. Click "Book Now".
4. Confirm the transaction.
**Expected Results**: 
- User receives a success confirmation.
- User is redirected to "My Bookings".
- The event's available seat count decreases by 1.
**Business Rule**: Standard User Flow
**Suggested Layer**: E2E

### TC-002: View Personal Bookings
**Category**: Happy Path
**Priority**: P1
**Preconditions**: User has at least one active booking.
**Steps**:
1. Navigate to the "My Bookings" section.
**Expected Results**: 
- The list of user's bookings is displayed correctly.
- Each booking shows relevant details (Event Name, Date, Seat Count).
**Business Rule**: User isolation
**Suggested Layer**: Component

### TC-100: FIFO Pruning Trigger (10th Booking)
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has 9 active bookings.
**Steps**:
1. User completes a 10th booking.
**Expected Results**: 
- The 10th booking is successful.
- The oldest booking (1st) is automatically pruned/archived according to FIFO policy.
**Business Rule**: FIFO pruning
**Suggested Layer**: API

### TC-101: Refund Eligibility Window
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has a booking for an event that starts in more than 24 hours.
**Steps**:
1. User attempts to cancel the booking.
**Expected Results**: 
- Cancellation is allowed.
- Refund is processed.
**Business Rule**: Refund eligibility
**Suggested Layer**: API

### TC-102: Refund Eligibility Window (Expired)
**Category**: Business Rule
**Priority**: P1
**Preconditions**: User has a booking for an event that starts in less than 24 hours.
**Steps**:
1. User attempts to cancel the booking.
**Expected Results**: 
- Cancellation is denied or allowed without refund.
- Clear message explaining the refund policy.
**Business Rule**: Refund eligibility
**Suggested Layer**: API

### TC-200: Unauthorized Booking Cancellation (IDOR)
**Category**: Security
**Priority**: P0
**Preconditions**: User A has a booking (ID: `999`). User B is logged in.
**Steps**:
1. User B sends a DELETE/POST request to cancel booking `999`.
**Expected Results**: 
- System returns `403 Forbidden` or `404 Not Found`.
- User A's booking remains intact.
**Business Rule**: User isolation
**Suggested Layer**: API

### TC-201: Negative Ticket Quantity via API
**Category**: Security
**Priority**: P1
**Preconditions**: User is logged in.
**Steps**:
1. User sends a booking request with `quantity: -5`.
**Expected Results**: 
- System returns `400 Bad Request`.
- No booking is created.
**Business Rule**: Input validation
**Suggested Layer**: API

### TC-300: Booking for Sold Out Event
**Category**: Negative
**Priority**: P0
**Preconditions**: Event has 0 available seats.
**Steps**:
1. Navigate to Event Details page.
2. Attempt to click "Book Now".
**Expected Results**: 
- "Book Now" button is disabled or hidden.
- If bypassed via API, system returns error.
**Business Rule**: Seat atomicity
**Suggested Layer**: E2E

### TC-301: Booking for Past Event
**Category**: Negative
**Priority**: P2
**Preconditions**: Event date is in the past.
**Steps**:
1. Attempt to book the event.
**Expected Results**: 
- Booking is rejected with an appropriate error message.
**Business Rule**: Date validation
**Suggested Layer**: API

### TC-400: Concurrency - Last Seat Race Condition
**Category**: Edge Case
**Priority**: P1
**Preconditions**: Event has exactly 1 seat left.
**Steps**:
1. User A and User B both submit a booking request simultaneously.
**Expected Results**: 
- Only one user succeeds.
- The other user receives a "Sold Out" or "Transaction Failed" error.
- Event seats never drop to `-1`.
**Business Rule**: Seat atomicity
**Suggested Layer**: API (Load/Concurrency)

### TC-500: Loading State during Booking
**Category**: UI State
**Priority**: P2
**Preconditions**: Slow network connection (simulated).
**Steps**:
1. Click "Book Now".
**Expected Results**: 
- A loading spinner or indicator is visible.
- Button is disabled to prevent double-click.
**Business Rule**: UX Guidelines
**Suggested Layer**: Component

### TC-501: Empty State - My Bookings
**Category**: UI State
**Priority**: P3
**Preconditions**: User has no bookings.
**Steps**:
1. Navigate to "My Bookings".
**Expected Results**: 
- Friendly empty state message is displayed (e.g., "You have no bookings yet. Explore events!").
**Business Rule**: UX Guidelines
**Suggested Layer**: Component

---
name: eventhub-domain
description: Provides deep domain knowledge about EventHub, including business rules, API reference, UI selectors, and user flows. Use this when you need to understand the project architecture, data models, or specific application logic for testing and development.
user-invocable: false
---

# EventHub Domain Knowledge

## Overview
EventHub is a full-stack event ticket booking platform designed for QA training. Users can browse events, book tickets, manage bookings, and create their own events in isolated sandboxes.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, React Query v5
- **Backend**: Express.js 4.21, Prisma ORM 5.22, MySQL 8+
- **Auth**: JWT (7-day expiry), bcryptjs password hashing
- **Testing**: Playwright (E2E), Chromium only
- **API Docs**: Swagger UI at `/api/docs`

## Core Data Models

### User
- Manages authentication and data isolation.
- Owns `Events` (user-created) and `Bookings`.

### Event
- Represents a bookable event (Conference, Concert, etc.).
- Includes fields for venue, city, date, price, and seat capacity.
- `isStatic`: Seeded events are immutable and common to all users.

### Booking
- Tracks ticket purchases for specific events.
- Includes customer details and a unique `bookingRef`.
- Seat counts are automatically managed during booking/cancellation.

## Business Rules & Technical Reference
For more detailed information, refer to the following resources within this skill:

- **Business Rules**: Detailed logic for validation, limits, and behavior (e.g., FIFO pruning, refund eligibility).
- **API Reference**: List of endpoints, request/response formats, and error codes.
- **UI Selectors**: Standard `data-testid` attributes used for E2E testing.
- **User Flows**: Common scenarios and test data for manual or automated verification.

## Instructions for Agent
When this skill is activated:
1. Always prioritize the business rules defined in the domain documentation over general assumptions.
2. Use the established `data-testid` conventions when writing or fixing Playwright tests.
3. Verify that any proposed changes to the backend adhere to the layered architecture (Routes -> Controllers -> Services -> Repositories).
4. For any booking-related tasks, ensure the atomic seat management logic is preserved.

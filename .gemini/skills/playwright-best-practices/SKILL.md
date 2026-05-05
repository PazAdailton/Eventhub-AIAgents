---
name: playwright-best-practices
description: Playwright E2E test automation standards — locator strategy, assertion patterns, test structure, POM, API mocking, auth patterns, and wait strategies. Use when writing, reviewing, or debugging Playwright tests.
---

# Playwright Test Automation Best Practices

This document defines the testing standards and patterns for the EventHub project.

## 1. Locator Strategy (Priority Order)
1. **data-testid**: `page.getByTestId('event-card')`
2. **Accessibility Roles**: `page.getByRole('button', { name: 'Submit' })`
3. **Labels and Placeholders**: `page.getByLabel('Email')`
4. **Element IDs**: `page.locator('#login-btn')`
5. **CSS Classes**: Last resort.

## 2. Assertion Patterns
- **Visibility**: `await expect(locator).toBeVisible()`
- **URL**: `await expect(page).toHaveURL(/.*bookings/)`
- **Content**: `await expect(locator).toContainText('Success')`

## 3. Test Structure
- Use `test.describe()` to group related tests.
- Use `// -- Step N: Description --` comments.
- Keep tests self-contained; avoid shared state.
- **Wait Strategies**: Prefer auto-waiting `expect` over `waitForTimeout` (never use `waitForTimeout`).

## 4. Test Users
- **Primary**: `rahulshetty1@gmail.com` / `Magiclife1!`
- **Secondary**: `rahulshetty1@yahoo.com` / `Magiclife1!`

## 5. Anti-Patterns to Avoid
- Arbitrary sleeps (`waitForTimeout`).
- Fragile CSS paths.
- Hardcoded IDs that change across environments.
- Missing assertions.

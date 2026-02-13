import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Profile Hub & Settings Pages
 *
 * Tests page accessibility, navigation, and basic structure.
 * These pages use client-side data fetching, so we test
 * that pages load without 500 errors and core UI renders.
 */

test.describe('Profile Hub', () => {
  test('can access profile hub page', async ({ page }) => {
    const response = await page.goto('/account');
    expect(response?.status()).toBeLessThan(500);
  });

  test('page has RTL direction', async ({ page }) => {
    await page.goto('/account');
    // Page renders either the hub, loading state, or error state — all have dir="rtl"
    const dirAttr = await page.locator('[dir="rtl"]').first().getAttribute('dir');
    expect(dirAttr).toBe('rtl');
  });

  test('shows loading or content state', async ({ page }) => {
    await page.goto('/account');
    // Should show either loading skeleton, error, or the hub
    const hasContent = await page.locator(
      '[data-testid="profile-hub-loading"], [data-testid="profile-hub-error"], [data-testid="profile-hub"]'
    ).first().isVisible();
    expect(hasContent).toBeTruthy();
  });
});

test.describe('Settings Page', () => {
  test('can access settings page', async ({ page }) => {
    const response = await page.goto('/account/settings');
    expect(response?.status()).toBeLessThan(500);
  });

  test('renders settings page with title', async ({ page }) => {
    await page.goto('/account/settings');
    await expect(page.getByText('הגדרות')).toBeVisible();
  });

  test('renders all settings sections', async ({ page }) => {
    await page.goto('/account/settings');
    await expect(page.getByText('כללי')).toBeVisible();
    await expect(page.getByText('ברירות מחדל להדפסה')).toBeVisible();
    await expect(page.getByText('חשבון')).toBeVisible();
  });

  test('renders app version footer', async ({ page }) => {
    await page.goto('/account/settings');
    await expect(page.getByTestId('app-version')).toHaveText('Footprint v2.1.0');
  });

  test('back button navigates to /account', async ({ page }) => {
    await page.goto('/account/settings');
    const backButton = page.getByTestId('settings-back-button');
    await expect(backButton).toBeVisible({ timeout: 10000 });
    await backButton.click();
    await page.waitForURL('**/account');
    expect(page.url()).toContain('/account');
  });

  test('toggle switches are interactive', async ({ page }) => {
    await page.goto('/account/settings');
    // Wait for settings page to fully render with Zustand hydration
    await expect(page.getByTestId('app-version')).toBeVisible({ timeout: 10000 });
    const switches = page.getByRole('switch');
    await expect(switches.first()).toBeVisible({ timeout: 10000 });
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Toggle the first switch
    const firstSwitch = switches.first();
    const initialState = await firstSwitch.getAttribute('aria-checked');
    await firstSwitch.click();
    const newState = await firstSwitch.getAttribute('aria-checked');
    expect(newState).not.toBe(initialState);
  });

  test('has RTL direction', async ({ page }) => {
    await page.goto('/account/settings');
    const settingsPage = page.getByTestId('settings-page');
    await expect(settingsPage).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Privacy Page', () => {
  test('can access privacy page', async ({ page }) => {
    const response = await page.goto('/account/privacy');
    expect(response?.status()).toBeLessThan(500);
  });

  test('renders privacy page title', async ({ page }) => {
    await page.goto('/account/privacy');
    await expect(page.getByText('פרטיות ואבטחה')).toBeVisible();
  });
});

test.describe('Support Page', () => {
  test('can access support page', async ({ page }) => {
    const response = await page.goto('/account/support');
    expect(response?.status()).toBeLessThan(500);
  });

  test('renders support page title', async ({ page }) => {
    await page.goto('/account/support');
    await expect(page.getByText('יצירת קשר')).toBeVisible();
  });

  test('shows contact methods', async ({ page }) => {
    await page.goto('/account/support');
    await expect(page.getByText('אימייל')).toBeVisible();
    await expect(page.getByText('טלפון')).toBeVisible();
    await expect(page.getByText('וואטסאפ')).toBeVisible();
  });

  test('shows FAQ section', async ({ page }) => {
    await page.goto('/account/support');
    await expect(page.getByText('שאלות נפוצות')).toBeVisible();
  });
});

test.describe('Navigation Integration', () => {
  test('profile edit page is accessible', async ({ page }) => {
    const response = await page.goto('/account/profile');
    expect(response?.status()).toBeLessThan(500);
  });

  test('profile edit back button goes to /account', async ({ page }) => {
    await page.goto('/account/profile');
    const backButton = page.getByTestId('back-button');
    await expect(backButton).toBeVisible({ timeout: 10000 });
    await backButton.click();
    await page.waitForURL('**/account');
    expect(page.url()).toContain('/account');
  });
});

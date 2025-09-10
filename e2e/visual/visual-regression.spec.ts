import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'admin@test.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('login page visual regression', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveScreenshot('login-page.png')
  })

  test('dashboard page visual regression', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-page.png')
  })

  test('product list visual regression', async ({ page }) => {
    await page.goto('/products')
    await expect(page).toHaveScreenshot('product-list.png')
  })

  test('add product modal visual regression', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')
    await expect(page.locator('[data-testid="product-modal"]')).toHaveScreenshot('add-product-modal.png')
  })

  test('responsive design - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await expect(page).toHaveScreenshot('dashboard-mobile.png')
  })

  test('responsive design - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await expect(page).toHaveScreenshot('dashboard-tablet.png')
  })
})

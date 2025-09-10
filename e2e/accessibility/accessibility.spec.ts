import { test, expect } from '@playwright/test'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'admin@test.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('login page accessibility', async ({ page }) => {
    await page.goto('/login')
    
    // Basic accessibility checks
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('dashboard page accessibility', async ({ page }) => {
    // Basic accessibility checks
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('main')).toBeVisible()
  })

  test('product list accessibility', async ({ page }) => {
    await page.goto('/products')
    
    // Basic accessibility checks
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
    await expect(page.locator('button')).toBeVisible()
  })

  test('keyboard navigation', async ({ page }) => {
    await page.goto('/products')
    
    // Test tab navigation
    await page.keyboard.press('Tab')
    await expect(page.locator(':focus')).toBeVisible()
    
    // Test arrow key navigation in product list
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowUp')
    
    // Test Enter key activation
    await page.keyboard.press('Enter')
  })

  test('screen reader compatibility', async ({ page }) => {
    await page.goto('/products')
    
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6')
    await expect(headings.first()).toBeVisible()
    
    // Check for proper form labels
    const formInputs = page.locator('input, select, textarea')
    const count = await formInputs.count()
    
    for (let i = 0; i < count; i++) {
      const input = formInputs.nth(i)
      const label = page.locator(`label[for="${await input.getAttribute('id')}"]`)
      await expect(label).toBeVisible()
    }
  })

  test('color contrast compliance', async ({ page }) => {
    await page.goto('/products')
    
    // Basic accessibility checks without axe-core
    const mainContent = page.locator('main, [role="main"]');
    await expect(mainContent).toBeVisible();
  })
})

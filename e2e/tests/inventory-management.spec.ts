import { test, expect } from '@playwright/test'

test.describe('Inventory Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'admin@test.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('should create new product', async ({ page }) => {
    await page.click('[data-testid="add-product-button"]')
    
    await page.fill('[data-testid="product-name"]', 'Test Product')
    await page.fill('[data-testid="product-sku"]', 'TEST-001')
    await page.fill('[data-testid="product-price"]', '29.99')
    await page.fill('[data-testid="product-quantity"]', '100')
    await page.selectOption('[data-testid="product-category"]', 'Electronics')
    
    await page.click('[data-testid="save-product-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-list"]')).toContainText('Test Product')
  })

  test('should edit existing product', async ({ page }) => {
    // Find and click edit button for first product
    await page.click('[data-testid="edit-product-button"]:first-of-type')
    
    await page.fill('[data-testid="product-name"]', 'Updated Product Name')
    await page.fill('[data-testid="product-price"]', '39.99')
    
    await page.click('[data-testid="save-product-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="product-list"]')).toContainText('Updated Product Name')
  })

  test('should delete product', async ({ page }) => {
    const initialCount = await page.locator('[data-testid="product-item"]').count()
    
    await page.click('[data-testid="delete-product-button"]:first-of-type')
    await page.click('[data-testid="confirm-delete-button"]')
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible()
    
    const finalCount = await page.locator('[data-testid="product-item"]').count()
    expect(finalCount).toBe(initialCount - 1)
  })

  test('should search products', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'Test Product')
    await page.click('[data-testid="search-button"]')
    
    const results = page.locator('[data-testid="product-item"]')
    await expect(results).toHaveCount(1)
    await expect(results.first()).toContainText('Test Product')
  })

  test('should filter products by category', async ({ page }) => {
    await page.selectOption('[data-testid="category-filter"]', 'Electronics')
    
    const results = page.locator('[data-testid="product-item"]')
    const count = await results.count()
    
    for (let i = 0; i < count; i++) {
      await expect(results.nth(i).locator('[data-testid="product-category"]')).toContainText('Electronics')
    }
  })
})

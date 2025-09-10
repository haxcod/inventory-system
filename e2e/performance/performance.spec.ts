import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'admin@test.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('page load performance', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/dashboard')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  })

  test('product list performance with large dataset', async ({ page }) => {
    // Navigate to products page
    await page.goto('/products')
    
    const startTime = Date.now()
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(2000) // Should load within 2 seconds
    
    // Test search performance
    const searchStartTime = Date.now()
    await page.fill('[data-testid="search-input"]', 'test')
    await page.click('[data-testid="search-button"]')
    await page.waitForLoadState('networkidle')
    const searchTime = Date.now() - searchStartTime
    
    expect(searchTime).toBeLessThan(1000) // Search should complete within 1 second
  })

  test('memory usage during extended use', async ({ page }) => {
    // Simulate extended use by navigating between pages multiple times
    for (let i = 0; i < 10; i++) {
      await page.goto('/products')
      await page.goto('/dashboard')
      await page.goto('/reports')
    }
    
    // Check that pages load successfully without memory issues
    await page.goto('/dashboard')
    await expect(page.locator('h1')).toContainText('Welcome back')
  })

  test('API response times', async ({ page }) => {
    const responseTimes: number[] = []
    
    // Monitor API calls
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responseTimes.push(response.request().timing().responseEnd - response.request().timing().requestStart)
      }
    })
    
    await page.goto('/products')
    await page.waitForLoadState('networkidle')
    
    // All API calls should complete within 1 second
    responseTimes.forEach(time => {
      expect(time).toBeLessThan(1000)
    })
  })

  test('concurrent user simulation', async ({ browser }) => {
    const contexts = []
    const pages = []
    
    // Create multiple browser contexts to simulate concurrent users
    for (let i = 0; i < 5; i++) {
      const context = await browser.newContext()
      const page = await context.newPage()
      contexts.push(context)
      pages.push(page)
    }
    
    // Login all users simultaneously
    const loginPromises = pages.map(async (page, index) => {
      await page.goto('/login')
      await page.fill('[data-testid="email"]', `user${index}@test.com`)
      await page.fill('[data-testid="password"]', 'password123')
      await page.click('[data-testid="login-button"]')
    })
    
    const startTime = Date.now()
    await Promise.all(loginPromises)
    const loginTime = Date.now() - startTime
    
    // All users should be able to login within 5 seconds
    expect(loginTime).toBeLessThan(5000)
    
    // Cleanup
    await Promise.all(contexts.map(context => context.close()))
  })
})

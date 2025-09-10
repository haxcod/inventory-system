import { test, expect } from '@playwright/test'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication - in real tests, you'd set up proper auth
    await page.goto('/')
  })

  test('should display dashboard with key metrics', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    
    // Check for key metric cards
    await expect(page.getByText('Total Products')).toBeVisible()
    await expect(page.getByText('Total Sales')).toBeVisible()
    await expect(page.getByText('Low Stock Items')).toBeVisible()
    await expect(page.getByText('Pending Orders')).toBeVisible()
  })

  test('should display navigation menu', async ({ page }) => {
    await expect(page.getByRole('navigation')).toBeVisible()
    
    // Check for main navigation items
    await expect(page.getByText('Products')).toBeVisible()
    await expect(page.getByText('Billing')).toBeVisible()
    await expect(page.getByText('Reports')).toBeVisible()
    await expect(page.getByText('Settings')).toBeVisible()
  })

  test('should navigate to products page', async ({ page }) => {
    await page.getByText('Products').click()
    await expect(page).toHaveURL('/products')
  })

  test('should navigate to billing page', async ({ page }) => {
    await page.getByText('Billing').click()
    await expect(page).toHaveURL('/billing')
  })

  test('should navigate to reports page', async ({ page }) => {
    await page.getByText('Reports').click()
    await expect(page).toHaveURL('/reports')
  })

  test('should display recent activity', async ({ page }) => {
    await expect(page.getByText('Recent Activity')).toBeVisible()
  })

  test('should display quick actions', async ({ page }) => {
    await expect(page.getByText('Quick Actions')).toBeVisible()
    
    // Check for quick action buttons
    await expect(page.getByRole('button', { name: 'Add Product' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Invoice' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'View Reports' })).toBeVisible()
  })
})

test.describe('Theme Toggle', () => {
  test('should toggle between light and dark theme', async ({ page }) => {
    await page.goto('/')
    
    const themeToggle = page.getByRole('button', { name: 'Toggle theme' })
    await expect(themeToggle).toBeVisible()
    
    // Check initial theme
    const html = page.locator('html')
    await expect(html).toHaveAttribute('data-theme', 'light')
    
    // Toggle to dark theme
    await themeToggle.click()
    await expect(html).toHaveAttribute('data-theme', 'dark')
    
    // Toggle back to light theme
    await themeToggle.click()
    await expect(html).toHaveAttribute('data-theme', 'light')
  })
})

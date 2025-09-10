import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrongpassword')
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    await expect(page.getByText('Invalid credentials')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.getByText('Create an account').click()
    await expect(page).toHaveURL('/register')
  })

  test('should toggle password visibility', async ({ page }) => {
    const passwordInput = page.getByLabel('Password')
    const toggleButton = page.getByRole('button', { name: 'Toggle password visibility' })
    
    await passwordInput.fill('testpassword')
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'text')
    
    await toggleButton.click()
    await expect(passwordInput).toHaveAttribute('type', 'password')
  })
})

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
  })

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    await expect(page.getByLabel('Full Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Confirm Password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible()
  })

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    await expect(page.getByText('Name is required')).toBeVisible()
    await expect(page.getByText('Email is required')).toBeVisible()
    await expect(page.getByText('Password is required')).toBeVisible()
  })

  test('should show error for password mismatch', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('password123')
    await page.getByLabel('Confirm Password').fill('differentpassword')
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should show error for weak password', async ({ page }) => {
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('123')
    await page.getByLabel('Confirm Password').fill('123')
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    await expect(page.getByText('Password must be at least 8 characters')).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.getByText('Already have an account?').click()
    await expect(page).toHaveURL('/login')
  })
})

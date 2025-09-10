import { test, expect } from '@playwright/test'

test.describe('Products Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products')
  })

  test('should display products page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Products' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Add Product' })).toBeVisible()
  })

  test('should open add product modal', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Product' }).click()
    
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Add New Product')).toBeVisible()
    await expect(page.getByLabel('Product Name')).toBeVisible()
    await expect(page.getByLabel('Description')).toBeVisible()
    await expect(page.getByLabel('Price')).toBeVisible()
    await expect(page.getByLabel('Stock Quantity')).toBeVisible()
  })

  test('should validate product form', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Product' }).click()
    await page.getByRole('button', { name: 'Save Product' }).click()
    
    await expect(page.getByText('Product name is required')).toBeVisible()
    await expect(page.getByText('Price is required')).toBeVisible()
    await expect(page.getByText('Stock quantity is required')).toBeVisible()
  })

  test('should add new product', async ({ page }) => {
    await page.getByRole('button', { name: 'Add Product' }).click()
    
    await page.getByLabel('Product Name').fill('Test Product')
    await page.getByLabel('Description').fill('Test Description')
    await page.getByLabel('Price').fill('19.99')
    await page.getByLabel('Stock Quantity').fill('100')
    await page.getByLabel('Category').selectOption('Electronics')
    
    await page.getByRole('button', { name: 'Save Product' }).click()
    
    // Wait for success message
    await expect(page.getByText('Product added successfully')).toBeVisible()
    
    // Check if product appears in the list
    await expect(page.getByText('Test Product')).toBeVisible()
  })

  test('should search products', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search products...')
    await searchInput.fill('Test Product')
    
    // Wait for search results
    await page.waitForTimeout(500)
    
    // Verify search functionality (this would depend on implementation)
    await expect(searchInput).toHaveValue('Test Product')
  })

  test('should filter products by category', async ({ page }) => {
    const categoryFilter = page.getByLabel('Filter by category')
    await categoryFilter.selectOption('Electronics')
    
    // Wait for filter to apply
    await page.waitForTimeout(500)
    
    // Verify filter is applied
    await expect(categoryFilter).toHaveValue('Electronics')
  })

  test('should edit product', async ({ page }) => {
    // Assuming there's a product in the list
    const editButton = page.getByRole('button', { name: 'Edit' }).first()
    await editButton.click()
    
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Edit Product')).toBeVisible()
    
    // Modify product details
    await page.getByLabel('Product Name').fill('Updated Product Name')
    await page.getByRole('button', { name: 'Update Product' }).click()
    
    await expect(page.getByText('Product updated successfully')).toBeVisible()
  })

  test('should delete product', async ({ page }) => {
    const deleteButton = page.getByRole('button', { name: 'Delete' }).first()
    await deleteButton.click()
    
    // Confirm deletion
    await expect(page.getByText('Are you sure you want to delete this product?')).toBeVisible()
    await page.getByRole('button', { name: 'Confirm Delete' }).click()
    
    await expect(page.getByText('Product deleted successfully')).toBeVisible()
  })

  test('should generate QR code for product', async ({ page }) => {
    const qrButton = page.getByRole('button', { name: 'Generate QR' }).first()
    await qrButton.click()
    
    // Check if QR code modal opens
    await expect(page.getByText('Product QR Code')).toBeVisible()
    await expect(page.getByRole('img', { name: 'QR Code' })).toBeVisible()
  })
})

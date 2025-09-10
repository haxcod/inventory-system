import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/products/route'

// Mock the MongoDB connection
jest.mock('@/lib/mongodb', () => ({
  default: jest.fn(() => Promise.resolve({
    db: jest.fn(() => ({
      collection: jest.fn(() => ({
        findOne: jest.fn(),
        find: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
        countDocuments: jest.fn(),
      }))
    }))
  }))
}))

// Mock the auth utilities
jest.mock('@/lib/auth', () => ({
  hasPermission: jest.fn(),
  getCurrentUser: jest.fn(),
}))

// Mock the Product model
jest.mock('@/models/Product', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}))

const Product = require('@/models/Product')
const { hasPermission, getCurrentUser } = require('@/lib/auth')

describe('/api/products - Product Management API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products - List Products', () => {
    it('should return products for user with read permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      const mockProducts = [
        {
          _id: 'product1',
          name: 'Test Product 1',
          sku: 'SKU001',
          price: 100,
          quantity: 50,
          category: 'Electronics',
          isActive: true
        },
        {
          _id: 'product2',
          name: 'Test Product 2',
          sku: 'SKU002',
          price: 200,
          quantity: 25,
          category: 'Clothing',
          isActive: true
        }
      ]

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.find.mockResolvedValue(mockProducts)

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.products).toHaveLength(2)
      expect(data.products[0]).toMatchObject({
        _id: 'product1',
        name: 'Test Product 1',
        sku: 'SKU001'
      })
    })

    it('should return 403 for user without read permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: []
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Insufficient permissions')
    })

    it('should return 401 for unauthenticated user', async () => {
      getCurrentUser.mockReturnValue(null)

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Authentication required')
    })

    it('should handle database errors gracefully', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.find.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/products')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should filter products by category', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      const mockProducts = [
        {
          _id: 'product1',
          name: 'Electronics Product',
          category: 'Electronics',
          isActive: true
        }
      ]

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.find.mockResolvedValue(mockProducts)

      const request = new NextRequest('http://localhost:3000/api/products?category=Electronics')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Product.find).toHaveBeenCalledWith({ category: 'Electronics', isActive: true })
    })

    it('should search products by name', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      const mockProducts = [
        {
          _id: 'product1',
          name: 'Test Product',
          isActive: true
        }
      ]

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.find.mockResolvedValue(mockProducts)

      const request = new NextRequest('http://localhost:3000/api/products?search=Test')
      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(Product.find).toHaveBeenCalledWith({
        $or: [
          { name: { $regex: 'Test', $options: 'i' } },
          { sku: { $regex: 'Test', $options: 'i' } }
        ],
        isActive: true
      })
    })
  })

  describe('POST /api/products - Create Product', () => {
    it('should create product for user with write permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      const newProduct = {
        name: 'New Product',
        sku: 'SKU003',
        price: 150,
        quantity: 30,
        category: 'Electronics',
        description: 'A new test product'
      }

      const createdProduct = {
        _id: 'product3',
        ...newProduct,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findOne.mockResolvedValue(null) // No existing product with same SKU
      Product.create.mockResolvedValue(createdProduct)

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.product).toMatchObject({
        _id: 'product3',
        name: 'New Product',
        sku: 'SKU003'
      })
    })

    it('should return 403 for user without write permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(false)

      const newProduct = {
        name: 'New Product',
        sku: 'SKU003',
        price: 150
      }

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Insufficient permissions')
    })

    it('should return 400 for duplicate SKU', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      const existingProduct = {
        _id: 'product1',
        sku: 'SKU001'
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findOne.mockResolvedValue(existingProduct)

      const newProduct = {
        name: 'New Product',
        sku: 'SKU001', // Duplicate SKU
        price: 150
      }

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(newProduct)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Product with this SKU already exists')
    })

    it('should return 400 for invalid product data', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)

      const invalidProduct = {
        name: '', // Empty name
        sku: 'SKU003',
        price: -100 // Negative price
      }

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(invalidProduct)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid product data')
    })

    it('should handle missing required fields', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)

      const incompleteProduct = {
        name: 'New Product'
        // Missing SKU and price
      }

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(incompleteProduct)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Name, SKU, and price are required')
    })
  })

  describe('PUT /api/products/[id] - Update Product', () => {
    it('should update product for user with write permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      const existingProduct = {
        _id: 'product1',
        name: 'Old Product',
        sku: 'SKU001',
        price: 100,
        quantity: 50
      }

      const updatedProduct = {
        _id: 'product1',
        name: 'Updated Product',
        sku: 'SKU001',
        price: 150,
        quantity: 75
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findById.mockResolvedValue(existingProduct)
      Product.findByIdAndUpdate.mockResolvedValue(updatedProduct)

      const request = new NextRequest('http://localhost:3000/api/products/product1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Product',
          price: 150,
          quantity: 75
        })
      })

      const response = await PUT(request, { params: { id: 'product1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.product).toMatchObject({
        _id: 'product1',
        name: 'Updated Product',
        price: 150
      })
    })

    it('should return 404 for non-existent product', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findById.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/products/nonexistent', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Product'
        })
      })

      const response = await PUT(request, { params: { id: 'nonexistent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Product not found')
    })

    it('should return 403 for user without write permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/products/product1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Product'
        })
      })

      const response = await PUT(request, { params: { id: 'product1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Insufficient permissions')
    })
  })

  describe('DELETE /api/products/[id] - Delete Product', () => {
    it('should delete product for user with delete permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'admin',
        permissions: ['delete:products']
      }

      const existingProduct = {
        _id: 'product1',
        name: 'Test Product',
        sku: 'SKU001'
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findById.mockResolvedValue(existingProduct)
      Product.findByIdAndDelete.mockResolvedValue(existingProduct)

      const request = new NextRequest('http://localhost:3000/api/products/product1', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'product1' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Product deleted successfully')
    })

    it('should return 404 for non-existent product', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'admin',
        permissions: ['delete:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findById.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/products/nonexistent', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'nonexistent' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Product not found')
    })

    it('should return 403 for user without delete permission', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/products/product1', {
        method: 'DELETE'
      })

      const response = await DELETE(request, { params: { id: 'product1' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Insufficient permissions')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle malformed product ID', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'user',
        permissions: ['read:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findById.mockRejectedValue(new Error('Invalid ID format'))

      const request = new NextRequest('http://localhost:3000/api/products/invalid-id')
      const response = await GET(request, { params: { id: 'invalid-id' } })
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should handle very large product data', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      const largeProduct = {
        name: 'A'.repeat(1000),
        sku: 'SKU003',
        price: 100,
        description: 'B'.repeat(10000)
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findOne.mockResolvedValue(null)
      Product.create.mockRejectedValue(new Error('Data too large'))

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify(largeProduct)
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should handle concurrent product updates', async () => {
      const mockUser = {
        userId: 'user1',
        email: 'user@test.com',
        role: 'manager',
        permissions: ['write:products']
      }

      getCurrentUser.mockReturnValue(mockUser)
      hasPermission.mockReturnValue(true)
      Product.findById.mockResolvedValue({ _id: 'product1', version: 1 })
      Product.findByIdAndUpdate.mockRejectedValue(new Error('Version conflict'))

      const request = new NextRequest('http://localhost:3000/api/products/product1', {
        method: 'PUT',
        body: JSON.stringify({
          name: 'Updated Product'
        })
      })

      const response = await PUT(request, { params: { id: 'product1' } })
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Product was modified by another user')
    })
  })
})

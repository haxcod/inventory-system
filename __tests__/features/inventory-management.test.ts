import { NextRequest } from 'next/server'
import { GET, POST } from '@/app/api/products/route'
import { PUT, DELETE } from '@/app/api/products/[id]/route'

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

// Mock the Inventory model
jest.mock('@/models/Inventory', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
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

// Mock the Branch model
jest.mock('@/models/Branch', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}))

const Inventory = require('@/models/Inventory')
const { hasPermission, getCurrentUser } = require('@/lib/auth')

describe('Inventory Management Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Inventory CRUD Operations', () => {
    it('should create new inventory item', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'admin',
        permissions: ['write:inventory']
      }

      const mockInventoryItem = {
        _id: 'inv1',
        productId: 'prod1',
        quantity: 100,
        location: 'Warehouse A',
        status: 'in_stock',
        lastUpdated: new Date()
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)
      Inventory.create.mockResolvedValue(mockInventoryItem)

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod1',
          quantity: 100,
          location: 'Warehouse A'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.inventory).toMatchObject({
        productId: 'prod1',
        quantity: 100,
        location: 'Warehouse A'
      })
    })

    it('should update inventory quantity', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'manager',
        permissions: ['write:inventory']
      }

      const mockUpdatedItem = {
        _id: 'inv1',
        productId: 'prod1',
        quantity: 150,
        location: 'Warehouse A',
        status: 'in_stock',
        lastUpdated: new Date()
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)
      Inventory.findByIdAndUpdate.mockResolvedValue(mockUpdatedItem)

      const request = new NextRequest('http://localhost:3000/api/inventory/inv1', {
        method: 'PUT',
        body: JSON.stringify({
          quantity: 150
        })
      })

      const response = await PUT(request, { params: { id: 'test-id' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inventory.quantity).toBe(150)
    })

    it('should get inventory by location', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'user',
        permissions: ['read:inventory']
      }

      const mockInventoryItems = [
        {
          _id: 'inv1',
          productId: 'prod1',
          quantity: 100,
          location: 'Warehouse A',
          status: 'in_stock'
        },
        {
          _id: 'inv2',
          productId: 'prod2',
          quantity: 50,
          location: 'Warehouse A',
          status: 'low_stock'
        }
      ]

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)
      Inventory.find.mockResolvedValue(mockInventoryItems)

      const request = new NextRequest('http://localhost:3000/api/inventory?location=Warehouse A')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inventory).toHaveLength(2)
      expect(data.inventory[0].location).toBe('Warehouse A')
    })

    it('should handle low stock alerts', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'manager',
        permissions: ['read:inventory']
      }

      const mockLowStockItems = [
        {
          _id: 'inv1',
          productId: 'prod1',
          quantity: 5,
          location: 'Warehouse A',
          status: 'low_stock',
          minQuantity: 10
        }
      ]

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)
      Inventory.find.mockResolvedValue(mockLowStockItems)

      const request = new NextRequest('http://localhost:3000/api/inventory?status=low_stock')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.inventory).toHaveLength(1)
      expect(data.inventory[0].status).toBe('low_stock')
    })
  })

  describe('Inventory Analytics', () => {
    it('should generate inventory report', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'admin',
        permissions: ['read:inventory']
      }

      const mockReport = {
        totalItems: 150,
        totalValue: 50000,
        lowStockItems: 5,
        outOfStockItems: 2,
        topProducts: [
          { productId: 'prod1', quantity: 100 },
          { productId: 'prod2', quantity: 80 }
        ]
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)
      Inventory.countDocuments.mockResolvedValue(150)

      const request = new NextRequest('http://localhost:3000/api/inventory/report')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.report).toBeDefined()
    })

    it('should track inventory movements', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'manager',
        permissions: ['write:inventory']
      }

      const mockMovement = {
        _id: 'mov1',
        inventoryId: 'inv1',
        type: 'adjustment',
        quantity: 10,
        reason: 'Stock correction',
        timestamp: new Date()
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)
      Inventory.findByIdAndUpdate.mockResolvedValue({})

      const request = new NextRequest('http://localhost:3000/api/inventory/inv1/movement', {
        method: 'POST',
        body: JSON.stringify({
          type: 'adjustment',
          quantity: 10,
          reason: 'Stock correction'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.movement).toMatchObject({
        type: 'adjustment',
        quantity: 10,
        reason: 'Stock correction'
      })
    })
  })

  describe('Inventory Validation', () => {
    it('should validate inventory data', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'admin',
        permissions: ['write:inventory']
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          productId: '',
          quantity: -10,
          location: ''
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toContain('Product ID is required')
      expect(data.errors).toContain('Quantity must be positive')
      expect(data.errors).toContain('Location is required')
    })

    it('should prevent duplicate inventory entries', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'admin',
        permissions: ['write:inventory']
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)
      Inventory.findOne.mockResolvedValue({
        _id: 'existing',
        productId: 'prod1',
        location: 'Warehouse A'
      })

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod1',
          quantity: 100,
          location: 'Warehouse A'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Inventory item already exists')
    })
  })
})

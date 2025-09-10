import { NextRequest } from 'next/server'
import { GET, POST, PUT, DELETE } from '@/app/api/users/route'

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
  hasRole: jest.fn(),
}))

// Mock the User model
jest.mock('@/models/User', () => ({
  find: jest.fn(),
  findById: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}))

const User = require('@/models/User')
const { hasPermission, getCurrentUser, hasRole } = require('@/lib/auth')

describe('User Management Feature Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('User CRUD Operations', () => {
    it('should create new user', async () => {
      const mockAdmin = {
        _id: 'admin1',
        role: 'admin',
        permissions: ['write:users']
      }

      const mockNewUser = {
        _id: 'user1',
        email: 'newuser@test.com',
        name: 'New User',
        role: 'user',
        permissions: ['read:products'],
        isActive: true,
        createdAt: new Date()
      }

      getCurrentUser.mockResolvedValue(mockAdmin)
      hasPermission.mockReturnValue(true)
      User.create.mockResolvedValue(mockNewUser)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@test.com',
          name: 'New User',
          role: 'user',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        email: 'newuser@test.com',
        name: 'New User',
        role: 'user'
      })
      expect(data.user.password).toBeUndefined() // Password should not be returned
    })

    it('should update user role', async () => {
      const mockAdmin = {
        _id: 'admin1',
        role: 'admin',
        permissions: ['write:users']
      }

      const mockUpdatedUser = {
        _id: 'user1',
        email: 'user@test.com',
        name: 'User',
        role: 'manager',
        permissions: ['read:products', 'write:products'],
        isActive: true,
        updatedAt: new Date()
      }

      getCurrentUser.mockResolvedValue(mockAdmin)
      hasPermission.mockReturnValue(true)
      User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser)

      const request = new NextRequest('http://localhost:3000/api/users/user1', {
        method: 'PUT',
        body: JSON.stringify({
          role: 'manager',
          permissions: ['read:products', 'write:products']
        })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.role).toBe('manager')
    })

    it('should deactivate user', async () => {
      const mockAdmin = {
        _id: 'admin1',
        role: 'admin',
        permissions: ['write:users']
      }

      const mockDeactivatedUser = {
        _id: 'user1',
        email: 'user@test.com',
        name: 'User',
        role: 'user',
        isActive: false,
        deactivatedAt: new Date()
      }

      getCurrentUser.mockResolvedValue(mockAdmin)
      hasPermission.mockReturnValue(true)
      User.findByIdAndUpdate.mockResolvedValue(mockDeactivatedUser)

      const request = new NextRequest('http://localhost:3000/api/users/user1', {
        method: 'PUT',
        body: JSON.stringify({
          isActive: false
        })
      })

      const response = await PUT(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.isActive).toBe(false)
    })

    it('should list users with pagination', async () => {
      const mockAdmin = {
        _id: 'admin1',
        role: 'admin',
        permissions: ['read:users']
      }

      const mockUsers = [
        {
          _id: 'user1',
          email: 'user1@test.com',
          name: 'User 1',
          role: 'user',
          isActive: true
        },
        {
          _id: 'user2',
          email: 'user2@test.com',
          name: 'User 2',
          role: 'manager',
          isActive: true
        }
      ]

      getCurrentUser.mockResolvedValue(mockAdmin)
      hasPermission.mockReturnValue(true)
      User.find.mockResolvedValue(mockUsers)
      User.countDocuments.mockResolvedValue(2)

      const request = new NextRequest('http://localhost:3000/api/users?page=1&limit=10')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.users).toHaveLength(2)
      expect(data.pagination).toBeDefined()
      expect(data.pagination.total).toBe(2)
    })
  })

  describe('User Permissions', () => {
    it('should check user permissions', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'manager',
        permissions: ['read:products', 'write:products']
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/users/permissions')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.permissions).toContain('read:products')
      expect(data.permissions).toContain('write:products')
    })

    it('should prevent unauthorized access', async () => {
      const mockUser = {
        _id: 'user1',
        role: 'user',
        permissions: ['read:products']
      }

      getCurrentUser.mockResolvedValue(mockUser)
      hasPermission.mockReturnValue(false)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'newuser@test.com',
          name: 'New User',
          role: 'user'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Insufficient permissions')
    })
  })

  describe('User Validation', () => {
    it('should validate user data', async () => {
      const mockAdmin = {
        _id: 'admin1',
        role: 'admin',
        permissions: ['write:users']
      }

      getCurrentUser.mockResolvedValue(mockAdmin)
      hasPermission.mockReturnValue(true)

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid-email',
          name: '',
          role: 'invalid-role'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.errors).toContain('Valid email is required')
      expect(data.errors).toContain('Name is required')
      expect(data.errors).toContain('Invalid role')
    })

    it('should prevent duplicate emails', async () => {
      const mockAdmin = {
        _id: 'admin1',
        role: 'admin',
        permissions: ['write:users']
      }

      getCurrentUser.mockResolvedValue(mockAdmin)
      hasPermission.mockReturnValue(true)
      User.findOne.mockResolvedValue({
        _id: 'existing',
        email: 'existing@test.com'
      })

      const request = new NextRequest('http://localhost:3000/api/users', {
        method: 'POST',
        body: JSON.stringify({
          email: 'existing@test.com',
          name: 'New User',
          role: 'user',
          password: 'password123'
        })
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.message).toContain('Email already exists')
    })
  })

  describe('User Analytics', () => {
    it('should generate user statistics', async () => {
      const mockAdmin = {
        _id: 'admin1',
        role: 'admin',
        permissions: ['read:users']
      }

      const mockStats = {
        totalUsers: 100,
        activeUsers: 95,
        inactiveUsers: 5,
        usersByRole: {
          admin: 2,
          manager: 8,
          user: 90
        },
        recentSignups: 10
      }

      getCurrentUser.mockResolvedValue(mockAdmin)
      hasPermission.mockReturnValue(true)
      User.countDocuments.mockResolvedValue(100)

      const request = new NextRequest('http://localhost:3000/api/users/stats')

      const response = await GET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.stats).toBeDefined()
    })
  })
})

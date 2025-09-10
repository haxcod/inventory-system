import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'
import { verifyPassword, generateToken } from '@/lib/auth'

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
  verifyPassword: jest.fn(),
  generateToken: jest.fn(),
  setAuthCookie: jest.fn(),
}))

// Mock the User model
jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
}))

const User = require('@/models/User')

describe('/api/auth/login - Comprehensive Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful Login Scenarios', () => {
    it('should login successfully with valid admin credentials', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin',
        permissions: ['read:all', 'write:all', 'delete:all'],
        isActive: true,
        password: 'hashedpassword'
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockResolvedValue(true)
      generateToken.mockReturnValue('mock-jwt-token')

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject({
        _id: mockUser._id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role
      })
      expect(data.token).toBe('mock-jwt-token')
      expect(verifyPassword).toHaveBeenCalledWith('password123', mockUser.password)
      expect(generateToken).toHaveBeenCalledWith({
        userId: mockUser._id,
        email: mockUser.email,
        role: mockUser.role,
        permissions: mockUser.permissions
      })
    })

    it('should login successfully with valid manager credentials', async () => {
      const mockUser = {
        _id: 'user2',
        email: 'manager@test.com',
        name: 'Manager User',
        role: 'manager',
        permissions: ['read:products', 'write:products'],
        isActive: true,
        password: 'hashedpassword'
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockResolvedValue(true)
      generateToken.mockReturnValue('mock-jwt-token')

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'manager@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.role).toBe('manager')
    })

    it('should login successfully with valid regular user credentials', async () => {
      const mockUser = {
        _id: 'user3',
        email: 'user@test.com',
        name: 'Regular User',
        role: 'user',
        permissions: ['read:products'],
        isActive: true,
        password: 'hashedpassword'
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockResolvedValue(true)
      generateToken.mockReturnValue('mock-jwt-token')

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'user@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user.role).toBe('user')
    })
  })

  describe('Authentication Failure Scenarios', () => {
    it('should return 401 for non-existent user', async () => {
      User.findOne.mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'nonexistent@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid credentials')
    })

    it('should return 401 for incorrect password', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@test.com',
        password: 'hashedpassword',
        isActive: true
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockResolvedValue(false)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'wrongpassword'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid credentials')
    })

    it('should return 401 for inactive user', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'inactive@test.com',
        password: 'hashedpassword',
        isActive: false
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockResolvedValue(true)

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'inactive@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Account is deactivated')
    })
  })

  describe('Input Validation Scenarios', () => {
    it('should return 400 for missing email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Email and password are required')
    })

    it('should return 400 for missing password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Email and password are required')
    })

    it('should return 400 for empty email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: '',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Email and password are required')
    })

    it('should return 400 for empty password', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: ''
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Email and password are required')
    })

    it('should return 400 for invalid JSON', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: 'invalid-json',
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid request body')
    })

    it('should return 400 for malformed email', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'not-an-email',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Email and password are required')
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle database connection errors', async () => {
      User.findOne.mockRejectedValue(new Error('Database connection failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should handle password verification errors', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@test.com',
        password: 'hashedpassword',
        isActive: true
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockRejectedValue(new Error('Password verification failed'))

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should handle token generation errors', async () => {
      const mockUser = {
        _id: 'user1',
        email: 'test@test.com',
        password: 'hashedpassword',
        isActive: true,
        role: 'user',
        permissions: ['read:products']
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockResolvedValue(true)
      generateToken.mockImplementation(() => {
        throw new Error('Token generation failed')
      })

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
    })

    it('should handle very long email addresses', async () => {
      const longEmail = 'a'.repeat(300) + '@test.com'
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: longEmail,
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle very long passwords', async () => {
      const longPassword = 'a'.repeat(1000)
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: longPassword
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle special characters in email', async () => {
      const specialEmail = 'test+special@test-domain.co.uk'
      const mockUser = {
        _id: 'user1',
        email: specialEmail,
        password: 'hashedpassword',
        isActive: true,
        role: 'user',
        permissions: ['read:products']
      }

      User.findOne.mockResolvedValue(mockUser)
      verifyPassword.mockResolvedValue(true)
      generateToken.mockReturnValue('mock-jwt-token')

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: specialEmail,
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
    })
  })

  describe('Security Tests', () => {
    it('should not expose sensitive information in error responses', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'))

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'test@test.com',
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Internal server error')
      expect(data).not.toHaveProperty('error')
      expect(data).not.toHaveProperty('stack')
    })

    it('should handle SQL injection attempts', async () => {
      const maliciousEmail = "'; DROP TABLE users; --"
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: maliciousEmail,
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })

    it('should handle XSS attempts in input', async () => {
      const xssEmail = '<script>alert("xss")</script>@test.com'
      
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: xssEmail,
          password: 'password123'
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
    })
  })
})

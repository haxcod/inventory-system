import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'

// Mock dependencies
jest.mock('@/lib/mongodb', () => ({
  connectDB: jest.fn(),
}))

jest.mock('@/models/User', () => ({
  findOne: jest.fn(),
}))

jest.mock('@/lib/auth', () => ({
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
  setAuthCookie: jest.fn(),
}))

describe('/api/auth/login', () => {
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    permissions: ['read:products'],
    isActive: true,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should login successfully with valid credentials', async () => {
    const { comparePassword, generateToken, setAuthCookie } = require('@/lib/auth')
    const { findOne } = require('@/models/User')

    findOne.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValue(true)
    generateToken.mockReturnValue('mock-jwt-token')

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
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
      role: mockUser.role,
    })
    expect(setAuthCookie).toHaveBeenCalledWith('mock-jwt-token', request)
  })

  it('should return error for invalid email', async () => {
    const { findOne } = require('@/models/User')
    findOne.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Invalid credentials')
  })

  it('should return error for invalid password', async () => {
    const { comparePassword } = require('@/lib/auth')
    const { findOne } = require('@/models/User')

    findOne.mockResolvedValue(mockUser)
    comparePassword.mockResolvedValue(false)

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Invalid credentials')
  })

  it('should return error for inactive user', async () => {
    const { findOne } = require('@/models/User')
    findOne.mockResolvedValue({ ...mockUser, isActive: false })

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Account is deactivated')
  })

  it('should return error for missing fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        // missing password
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.success).toBe(false)
    expect(data.message).toBe('Email and password are required')
  })

  it('should return error for invalid JSON', async () => {
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
})

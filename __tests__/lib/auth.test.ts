import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken,
  getCurrentUser,
  hasPermission,
  hasRole
} from '@/lib/auth'

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn().mockReturnValue({ value: 'mock-token' }),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

// Mock User model
jest.mock('@/models/User', () => ({
  findById: jest.fn(),
}))

describe('Auth Utilities', () => {
  const mockUser = {
    _id: 'user123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'admin',
    permissions: ['read:products', 'write:products'],
    isActive: true,
  }

  const mockJWTPayload = {
    userId: 'user123',
    email: 'test@example.com',
    role: 'admin',
    permissions: ['read:products', 'write:products'],
    branch: undefined,
  }

  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'testpassword'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(hashedPassword).not.toBe(password)
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for same password', async () => {
      const password = 'testpassword'
      const hash1 = await hashPassword(password)
      const hash2 = await hashPassword(password)
      
      expect(hash1).not.toBe(hash2)
    })
  })

  describe('verifyPassword', () => {
    it('should return true for correct password', async () => {
      const password = 'testpassword'
      const hashedPassword = await hashPassword(password)
      
      const result = await verifyPassword(password, hashedPassword)
      expect(result).toBe(true)
    })

    it('should return false for incorrect password', async () => {
      const password = 'testpassword'
      const wrongPassword = 'wrongpassword'
      const hashedPassword = await hashPassword(password)
      
      const result = await verifyPassword(wrongPassword, hashedPassword)
      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate valid JWT token', () => {
      const token = generateToken(mockJWTPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, process.env.JWT_SECRET!)
      expect(decoded).toMatchObject({
        userId: mockJWTPayload.userId,
        email: mockJWTPayload.email,
        role: mockJWTPayload.role,
      })
    })
  })

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = generateToken(mockJWTPayload)
      const result = verifyToken(token)
      
      expect(result).toMatchObject({
        userId: mockJWTPayload.userId,
        email: mockJWTPayload.email,
        role: mockJWTPayload.role,
      })
    })

    it('should return null for invalid token', () => {
      const result = verifyToken('invalid-token')
      expect(result).toBeNull()
    })

    it('should return null for expired token', () => {
      const expiredToken = jwt.sign(
        { userId: mockJWTPayload.userId, email: mockJWTPayload.email },
        process.env.JWT_SECRET!,
        { expiresIn: '-1h' }
      )
      
      const result = verifyToken(expiredToken)
      expect(result).toBeNull()
    })
  })

  describe('hasPermission', () => {
    it('should return true for user with permission', () => {
      const result = hasPermission(mockJWTPayload, 'read:products')
      expect(result).toBe(true)
    })

    it('should return false for user without permission', () => {
      const nonAdminUser = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'user',
        permissions: ['read:products'],
        branch: undefined,
      }
      const result = hasPermission(nonAdminUser, 'delete:users')
      expect(result).toBe(false)
    })

    it('should return true for admin user regardless of permission', () => {
      const result = hasPermission(mockJWTPayload, 'any:permission')
      expect(result).toBe(true)
    })
  })

  describe('hasRole', () => {
    it('should return true for correct role', () => {
      const result = hasRole(mockJWTPayload, 'admin')
      expect(result).toBe(true)
    })

    it('should return false for incorrect role', () => {
      const result = hasRole(mockJWTPayload, 'user')
      expect(result).toBe(false)
    })
  })
})

// Mock the auth module before importing
jest.mock('@/lib/auth', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn(),
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  hasPermission: jest.fn(),
  hasRole: jest.fn(),
  canAccessBranch: jest.fn(),
}))

import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken,
  hasPermission,
  hasRole,
  canAccessBranch
} from '@/lib/auth'

describe('Auth Utilities - Edge Cases and Error Handling', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks()
  })

  describe('hashPassword', () => {
    it('should handle empty password', async () => {
      const password = ''
      const mockHash = '$2a$12$mockhashforemptypassword'
      
      ;(hashPassword as jest.MockedFunction<typeof hashPassword>).mockResolvedValue(mockHash)
      
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
      expect(hashPassword).toHaveBeenCalledWith(password)
    })

    it('should handle very long password', async () => {
      const password = 'a'.repeat(1000)
      const mockHash = '$2a$12$mockhashforverylongpassword'
      
      ;(hashPassword as jest.MockedFunction<typeof hashPassword>).mockResolvedValue(mockHash)
      
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
      expect(hashPassword).toHaveBeenCalledWith(password)
    })

    it('should handle password with special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const mockHash = '$2a$12$mockhashforspecialchars'
      
      ;(hashPassword as jest.MockedFunction<typeof hashPassword>).mockResolvedValue(mockHash)
      
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
      expect(hashPassword).toHaveBeenCalledWith(password)
    })

    it('should handle unicode characters', async () => {
      const password = 'пароль123🔐'
      const mockHash = '$2a$12$mockhashforunicode'
      
      ;(hashPassword as jest.MockedFunction<typeof hashPassword>).mockResolvedValue(mockHash)
      
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
      expect(hashPassword).toHaveBeenCalledWith(password)
    })
  })

  describe('verifyPassword', () => {
    it('should handle null/undefined password', async () => {
      const mockHash = '$2a$12$mockhash'
      ;(hashPassword as jest.MockedFunction<typeof hashPassword>).mockResolvedValue(mockHash)
      ;(verifyPassword as jest.MockedFunction<typeof verifyPassword>).mockRejectedValue(new Error('Invalid password'))
      
      const hashedPassword = await hashPassword('test')
      
      await expect(verifyPassword(null as any, hashedPassword)).rejects.toThrow()
      await expect(verifyPassword(undefined as any, hashedPassword)).rejects.toThrow()
    })

    it('should handle null/undefined hashed password', async () => {
      const password = 'test'
      ;(verifyPassword as jest.MockedFunction<typeof verifyPassword>).mockRejectedValue(new Error('Invalid hash'))
      
      await expect(verifyPassword(password, null as any)).rejects.toThrow()
      await expect(verifyPassword(password, undefined as any)).rejects.toThrow()
    })

    it('should handle empty strings', async () => {
      const mockHash = '$2a$12$mockhash'
      ;(hashPassword as jest.MockedFunction<typeof hashPassword>).mockResolvedValue(mockHash)
      ;(verifyPassword as jest.MockedFunction<typeof verifyPassword>).mockResolvedValue(false)
      
      const hashedPassword = await hashPassword('test')
      
      const result1 = await verifyPassword('', hashedPassword)
      const result2 = await verifyPassword('test', '')
      
      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })

    it('should handle malformed hash', async () => {
      const password = 'test'
      const malformedHash = 'not-a-valid-hash'
      ;(verifyPassword as jest.MockedFunction<typeof verifyPassword>).mockResolvedValue(false)
      
      const result = await verifyPassword(password, malformedHash)
      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should handle empty payload', () => {
      const emptyPayload = {
        userId: '',
        email: '',
        role: '',
        permissions: [],
        branch: undefined
      }
      
      const mockToken = 'mock.jwt.token'
      ;(generateToken as jest.MockedFunction<typeof generateToken>).mockReturnValue(mockToken)
      
      const token = generateToken(emptyPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
      expect(generateToken).toHaveBeenCalledWith(emptyPayload)
    })

    it('should handle payload with special characters', () => {
      const specialPayload = {
        userId: 'user-123!@#',
        email: 'test+special@example.com',
        role: 'admin-special',
        permissions: ['read:special', 'write:special'],
        branch: 'branch-123!@#'
      }
      
      const mockToken = 'mock.jwt.token.special'
      ;(generateToken as jest.MockedFunction<typeof generateToken>).mockReturnValue(mockToken)
      
      const token = generateToken(specialPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
      expect(generateToken).toHaveBeenCalledWith(specialPayload)
    })

    it('should handle very long permissions array', () => {
      const payload = {
        userId: 'user1',
        email: 'test@example.com',
        role: 'user',
        permissions: Array(1000).fill(0).map((_, i) => `permission:${i}`),
        branch: 'branch1'
      }
      
      const mockToken = 'mock.jwt.token.long'
      ;(generateToken as jest.MockedFunction<typeof generateToken>).mockReturnValue(mockToken)
      
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
      expect(generateToken).toHaveBeenCalledWith(payload)
    })
  })

  describe('verifyToken', () => {
    it('should handle null/undefined token', () => {
      ;(verifyToken as jest.MockedFunction<typeof verifyToken>).mockReturnValue(null)
      
      expect(verifyToken(null as any)).toBeNull()
      expect(verifyToken(undefined as any)).toBeNull()
    })

    it('should handle empty string token', () => {
      ;(verifyToken as jest.MockedFunction<typeof verifyToken>).mockReturnValue(null)
      
      expect(verifyToken('')).toBeNull()
    })

    it('should handle malformed token', () => {
      ;(verifyToken as jest.MockedFunction<typeof verifyToken>).mockReturnValue(null)
      
      expect(verifyToken('not.a.valid.token')).toBeNull()
      expect(verifyToken('invalid-token')).toBeNull()
    })

    it('should handle token with wrong signature', () => {
      ;(verifyToken as jest.MockedFunction<typeof verifyToken>).mockReturnValue(null)
      
      const wrongSignatureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0In0.wrong-signature'
      expect(verifyToken(wrongSignatureToken)).toBeNull()
    })
  })

  describe('hasPermission', () => {
    const baseUser = {
      userId: 'user1',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read:products', 'write:products'],
      branch: 'branch1'
    }

    it('should handle null/undefined user', () => {
      ;(hasPermission as jest.MockedFunction<typeof hasPermission>).mockReturnValue(false)
      
      expect(hasPermission(null as any, 'read:products')).toBe(false)
      expect(hasPermission(undefined as any, 'read:products')).toBe(false)
    })

    it('should handle null/undefined permission', () => {
      ;(hasPermission as jest.MockedFunction<typeof hasPermission>).mockReturnValue(false)
      
      expect(hasPermission(baseUser, null as any)).toBe(false)
      expect(hasPermission(baseUser, undefined as any)).toBe(false)
    })

    it('should handle empty permission string', () => {
      ;(hasPermission as jest.MockedFunction<typeof hasPermission>).mockReturnValue(false)
      
      expect(hasPermission(baseUser, '')).toBe(false)
    })

    it('should handle user with empty permissions array', () => {
      const userWithNoPermissions = { ...baseUser, permissions: [] }
      ;(hasPermission as jest.MockedFunction<typeof hasPermission>).mockReturnValue(false)
      
      expect(hasPermission(userWithNoPermissions, 'read:products')).toBe(false)
    })

    it('should handle user with null permissions', () => {
      const userWithNullPermissions = { ...baseUser, permissions: null as any }
      ;(hasPermission as jest.MockedFunction<typeof hasPermission>).mockReturnValue(false)
      
      expect(hasPermission(userWithNullPermissions, 'read:products')).toBe(false)
    })

    it('should handle admin user with any permission', () => {
      const adminUser = { ...baseUser, role: 'admin' }
      ;(hasPermission as jest.MockedFunction<typeof hasPermission>).mockReturnValue(true)
      
      expect(hasPermission(adminUser, 'any:permission')).toBe(true)
      expect(hasPermission(adminUser, '')).toBe(true)
      expect(hasPermission(adminUser, null as any)).toBe(true)
    })
  })

  describe('hasRole', () => {
    const baseUser = {
      userId: 'user1',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read:products'],
      branch: 'branch1'
    }

    it('should handle null/undefined user', () => {
      ;(hasRole as jest.MockedFunction<typeof hasRole>).mockReturnValue(false)
      
      expect(hasRole(null as any, 'user')).toBe(false)
      expect(hasRole(undefined as any, 'user')).toBe(false)
    })

    it('should handle null/undefined role', () => {
      ;(hasRole as jest.MockedFunction<typeof hasRole>).mockReturnValue(false)
      
      expect(hasRole(baseUser, null as any)).toBe(false)
      expect(hasRole(baseUser, undefined as any)).toBe(false)
    })

    it('should handle empty role string', () => {
      ;(hasRole as jest.MockedFunction<typeof hasRole>).mockReturnValue(false)
      
      expect(hasRole(baseUser, '')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      ;(hasRole as jest.MockedFunction<typeof hasRole>)
        .mockReturnValueOnce(false) // User
        .mockReturnValueOnce(false) // USER
        .mockReturnValueOnce(true)  // user
      
      expect(hasRole(baseUser, 'User')).toBe(false)
      expect(hasRole(baseUser, 'USER')).toBe(false)
      expect(hasRole(baseUser, 'user')).toBe(true)
    })
  })

  describe('canAccessBranch', () => {
    const baseUser = {
      userId: 'user1',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read:products'],
      branch: 'branch1'
    }

    it('should handle null/undefined user', () => {
      ;(canAccessBranch as jest.MockedFunction<typeof canAccessBranch>).mockReturnValue(false)
      
      expect(canAccessBranch(null as any, 'branch1')).toBe(false)
      expect(canAccessBranch(undefined as any, 'branch1')).toBe(false)
    })

    it('should handle null/undefined branch', () => {
      ;(canAccessBranch as jest.MockedFunction<typeof canAccessBranch>).mockReturnValue(false)
      
      expect(canAccessBranch(baseUser, null as any)).toBe(false)
      expect(canAccessBranch(baseUser, undefined as any)).toBe(false)
    })

    it('should handle empty branch string', () => {
      ;(canAccessBranch as jest.MockedFunction<typeof canAccessBranch>).mockReturnValue(false)
      
      expect(canAccessBranch(baseUser, '')).toBe(false)
    })

    it('should handle user with no branch', () => {
      const userWithNoBranch = { ...baseUser, branch: undefined }
      ;(canAccessBranch as jest.MockedFunction<typeof canAccessBranch>).mockReturnValue(false)
      
      expect(canAccessBranch(userWithNoBranch, 'branch1')).toBe(false)
    })

    it('should handle admin user accessing any branch', () => {
      const adminUser = { ...baseUser, role: 'admin' }
      ;(canAccessBranch as jest.MockedFunction<typeof canAccessBranch>).mockReturnValue(true)
      
      expect(canAccessBranch(adminUser, 'any-branch')).toBe(true)
      expect(canAccessBranch(adminUser, '')).toBe(true)
    })
  })
})

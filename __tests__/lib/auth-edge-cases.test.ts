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
  describe('hashPassword', () => {
    it('should handle empty password', async () => {
      const password = ''
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should handle very long password', async () => {
      const password = 'a'.repeat(1000)
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should handle password with special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
    })

    it('should handle unicode characters', async () => {
      const password = 'пароль123🔐'
      const hashedPassword = await hashPassword(password)
      
      expect(hashedPassword).toBeDefined()
      expect(typeof hashedPassword).toBe('string')
      expect(hashedPassword.length).toBeGreaterThan(0)
    })
  })

  describe('verifyPassword', () => {
    it('should handle null/undefined password', async () => {
      const hashedPassword = await hashPassword('test')
      
      await expect(verifyPassword(null as any, hashedPassword)).rejects.toThrow()
      await expect(verifyPassword(undefined as any, hashedPassword)).rejects.toThrow()
    })

    it('should handle null/undefined hashed password', async () => {
      const password = 'test'
      
      await expect(verifyPassword(password, null as any)).rejects.toThrow()
      await expect(verifyPassword(password, undefined as any)).rejects.toThrow()
    })

    it('should handle empty strings', async () => {
      const hashedPassword = await hashPassword('test')
      
      const result1 = await verifyPassword('', hashedPassword)
      const result2 = await verifyPassword('test', '')
      
      expect(result1).toBe(false)
      expect(result2).toBe(false)
    })

    it('should handle malformed hash', async () => {
      const password = 'test'
      const malformedHash = 'not-a-valid-hash'
      
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
      
      const token = generateToken(emptyPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should handle payload with special characters', () => {
      const specialPayload = {
        userId: 'user-123!@#',
        email: 'test+special@example.com',
        role: 'admin-special',
        permissions: ['read:special', 'write:special'],
        branch: 'branch-123!@#'
      }
      
      const token = generateToken(specialPayload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })

    it('should handle very long permissions array', () => {
      const longPermissions = Array.from({ length: 1000 }, (_, i) => `permission:${i}`)
      const payload = {
        userId: 'user123',
        email: 'test@example.com',
        role: 'admin',
        permissions: longPermissions,
        branch: undefined
      }
      
      const token = generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.length).toBeGreaterThan(0)
    })
  })

  describe('verifyToken', () => {
    it('should handle null/undefined token', () => {
      expect(verifyToken(null as any)).toBeNull()
      expect(verifyToken(undefined as any)).toBeNull()
    })

    it('should handle empty string token', () => {
      expect(verifyToken('')).toBeNull()
    })

    it('should handle malformed token', () => {
      expect(verifyToken('not.a.valid.token')).toBeNull()
      expect(verifyToken('invalid-token')).toBeNull()
    })

    it('should handle token with wrong signature', () => {
      const wrongSignatureToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0In0.wrong-signature'
      expect(verifyToken(wrongSignatureToken)).toBeNull()
    })
  })

  describe('hasPermission', () => {
    const baseUser = {
      userId: 'user123',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read:products', 'write:products'],
      branch: undefined
    }

    it('should handle null/undefined user', () => {
      expect(hasPermission(null as any, 'read:products')).toBe(false)
      expect(hasPermission(undefined as any, 'read:products')).toBe(false)
    })

    it('should handle null/undefined permission', () => {
      expect(hasPermission(baseUser, null as any)).toBe(false)
      expect(hasPermission(baseUser, undefined as any)).toBe(false)
    })

    it('should handle empty permission string', () => {
      expect(hasPermission(baseUser, '')).toBe(false)
    })

    it('should handle user with empty permissions array', () => {
      const userWithNoPermissions = { ...baseUser, permissions: [] }
      expect(hasPermission(userWithNoPermissions, 'read:products')).toBe(false)
    })

    it('should handle user with null permissions', () => {
      const userWithNullPermissions = { ...baseUser, permissions: null as any }
      expect(hasPermission(userWithNullPermissions, 'read:products')).toBe(false)
    })

    it('should handle admin user with any permission', () => {
      const adminUser = { ...baseUser, role: 'admin' }
      expect(hasPermission(adminUser, 'any:permission')).toBe(true)
      expect(hasPermission(adminUser, '')).toBe(true)
      expect(hasPermission(adminUser, null as any)).toBe(true)
    })
  })

  describe('hasRole', () => {
    const baseUser = {
      userId: 'user123',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read:products'],
      branch: undefined
    }

    it('should handle null/undefined user', () => {
      expect(hasRole(null as any, 'user')).toBe(false)
      expect(hasRole(undefined as any, 'user')).toBe(false)
    })

    it('should handle null/undefined role', () => {
      expect(hasRole(baseUser, null as any)).toBe(false)
      expect(hasRole(baseUser, undefined as any)).toBe(false)
    })

    it('should handle empty role string', () => {
      expect(hasRole(baseUser, '')).toBe(false)
    })

    it('should handle case sensitivity', () => {
      expect(hasRole(baseUser, 'User')).toBe(false)
      expect(hasRole(baseUser, 'USER')).toBe(false)
      expect(hasRole(baseUser, 'user')).toBe(true)
    })
  })

  describe('canAccessBranch', () => {
    const baseUser = {
      userId: 'user123',
      email: 'test@example.com',
      role: 'user',
      permissions: ['read:products'],
      branch: 'branch1'
    }

    it('should handle null/undefined user', () => {
      expect(canAccessBranch(null as any, 'branch1')).toBe(false)
      expect(canAccessBranch(undefined as any, 'branch1')).toBe(false)
    })

    it('should handle null/undefined branch', () => {
      expect(canAccessBranch(baseUser, null as any)).toBe(false)
      expect(canAccessBranch(baseUser, undefined as any)).toBe(false)
    })

    it('should handle empty branch string', () => {
      expect(canAccessBranch(baseUser, '')).toBe(false)
    })

    it('should handle user with no branch', () => {
      const userWithNoBranch = { ...baseUser, branch: undefined }
      expect(canAccessBranch(userWithNoBranch, 'branch1')).toBe(false)
    })

    it('should handle admin user accessing any branch', () => {
      const adminUser = { ...baseUser, role: 'admin' }
      expect(canAccessBranch(adminUser, 'any-branch')).toBe(true)
      expect(canAccessBranch(adminUser, '')).toBe(true)
    })
  })
})

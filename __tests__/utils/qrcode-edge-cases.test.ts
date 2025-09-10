import { 
  generateQRCode, 
  parseQRCodeData, 
  validateProductQRData,
  generateProductQRData,
  generateProductQRCode
} from '@/utils/qrcode'

// Mock qrcode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn(),
  toString: jest.fn(),
}))

const qrcode = require('qrcode')

describe('QR Code Utilities - Edge Cases and Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateQRCode - Edge Cases', () => {
    it('should handle empty string data', async () => {
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,empty-qr')

      const result = await generateQRCode('')
      
      expect(result).toBe('data:image/png;base64,empty-qr')
      expect(qrcode.toDataURL).toHaveBeenCalledWith('', expect.any(Object))
    })

    it('should handle very long data strings', async () => {
      const longData = 'A'.repeat(10000)
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,long-qr')

      const result = await generateQRCode(longData)
      
      expect(result).toBe('data:image/png;base64,long-qr')
      expect(qrcode.toDataURL).toHaveBeenCalledWith(longData, expect.any(Object))
    })

    it('should handle data with special characters', async () => {
      const specialData = '!@#$%^&*()_+-=[]{}|;:,.<>?'
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,special-qr')

      const result = await generateQRCode(specialData)
      
      expect(result).toBe('data:image/png;base64,special-qr')
      expect(qrcode.toDataURL).toHaveBeenCalledWith(specialData, expect.any(Object))
    })

    it('should handle unicode characters', async () => {
      const unicodeData = 'Hello 世界 🌍'
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,unicode-qr')

      const result = await generateQRCode(unicodeData)
      
      expect(result).toBe('data:image/png;base64,unicode-qr')
      expect(qrcode.toDataURL).toHaveBeenCalledWith(unicodeData, expect.any(Object))
    })

    it('should handle null and undefined data', async () => {
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,null-qr')

      const result1 = await generateQRCode(null as any)
      const result2 = await generateQRCode(undefined as any)
      
      expect(result1).toBe('data:image/png;base64,null-qr')
      expect(result2).toBe('data:image/png;base64,null-qr')
    })

    it('should handle custom options', async () => {
      const customOptions = {
        width: 500,
        margin: 5,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }
      
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,custom-qr')

      const result = await generateQRCode('test', customOptions)
      
      expect(result).toBe('data:image/png;base64,custom-qr')
      expect(qrcode.toDataURL).toHaveBeenCalledWith('test', expect.objectContaining(customOptions))
    })

    it('should handle QR generation errors gracefully', async () => {
      qrcode.toDataURL.mockRejectedValue(new Error('QR generation failed'))

      await expect(generateQRCode('test-data')).rejects.toThrow('Failed to generate QR code')
    })

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Network timeout')
      timeoutError.name = 'TimeoutError'
      qrcode.toDataURL.mockRejectedValue(timeoutError)

      await expect(generateQRCode('test-data')).rejects.toThrow('Failed to generate QR code')
    })

    it('should handle memory errors for very large data', async () => {
      const memoryError = new Error('Out of memory')
      memoryError.name = 'RangeError'
      qrcode.toDataURL.mockRejectedValue(memoryError)

      await expect(generateQRCode('A'.repeat(100000))).rejects.toThrow('Failed to generate QR code')
    })
  })

  describe('parseQRCodeData - Edge Cases', () => {
    it('should handle empty string data', () => {
      const result = parseQRCodeData('')
      expect(result).toBeNull()
    })

    it('should handle null and undefined data', () => {
      expect(parseQRCodeData(null as any)).toBeNull()
      expect(parseQRCodeData(undefined as any)).toBeNull()
    })

    it('should handle non-JSON data', () => {
      const result = parseQRCodeData('not-json-data')
      expect(result).toBeNull()
    })

    it('should handle malformed JSON', () => {
      const malformedJson = '{"incomplete": json'
      const result = parseQRCodeData(malformedJson)
      expect(result).toBeNull()
    })

    it('should handle JSON with circular references', () => {
      const circularJson = '{"circular": "[Circular]"}'
      const result = parseQRCodeData(circularJson)
      expect(result).toEqual({ circular: '[Circular]' })
    })

    it('should handle very large JSON data', () => {
      const largeData = {
        data: 'A'.repeat(100000),
        metadata: { size: 'large' }
      }
      const largeJson = JSON.stringify(largeData)
      
      const result = parseQRCodeData(largeJson)
      expect(result).toEqual(largeData)
    })

    it('should handle JSON with special characters', () => {
      const specialData = {
        message: 'Hello "world" with \'quotes\' and \n newlines',
        symbols: '!@#$%^&*()'
      }
      const specialJson = JSON.stringify(specialData)
      
      const result = parseQRCodeData(specialJson)
      expect(result).toEqual(specialData)
    })

    it('should handle JSON with unicode characters', () => {
      const unicodeData = {
        message: 'Hello 世界 🌍',
        emoji: '😀🎉🚀'
      }
      const unicodeJson = JSON.stringify(unicodeData)
      
      const result = parseQRCodeData(unicodeJson)
      expect(result).toEqual(unicodeData)
    })

    it('should handle JSON with nested objects and arrays', () => {
      const complexData = {
        products: [
          { id: 1, name: 'Product 1', tags: ['tag1', 'tag2'] },
          { id: 2, name: 'Product 2', tags: ['tag3'] }
        ],
        metadata: {
          count: 2,
          timestamp: new Date().toISOString()
        }
      }
      const complexJson = JSON.stringify(complexData)
      
      const result = parseQRCodeData(complexJson)
      expect(result).toEqual(complexData)
    })
  })

  describe('validateProductQRData - Edge Cases', () => {
    it('should handle null and undefined data', () => {
      expect(validateProductQRData(null)).toBe(false)
      expect(validateProductQRData(undefined)).toBe(false)
    })

    it('should handle non-object data', () => {
      expect(validateProductQRData('string')).toBe(false)
      expect(validateProductQRData(123)).toBe(false)
      expect(validateProductQRData(true)).toBe(false)
      expect(validateProductQRData([])).toBe(false)
    })

    it('should handle empty object', () => {
      expect(validateProductQRData({})).toBe(false)
    })

    it('should handle object with wrong type', () => {
      const wrongTypeData = {
        type: 'user',
        id: '123',
        sku: 'SKU001',
        name: 'Test Product',
        price: 100
      }
      expect(validateProductQRData(wrongTypeData)).toBe(false)
    })

    it('should handle missing required fields', () => {
      const incompleteData = {
        type: 'product',
        id: '123'
        // Missing sku, name, price
      }
      expect(validateProductQRData(incompleteData)).toBe(false)
    })

    it('should handle invalid price types', () => {
      const invalidPriceData = {
        type: 'product',
        id: '123',
        sku: 'SKU001',
        name: 'Test Product',
        price: 'not-a-number'
      }
      expect(validateProductQRData(invalidPriceData)).toBe(false)
    })

    it('should handle negative price', () => {
      const negativePriceData = {
        type: 'product',
        id: '123',
        sku: 'SKU001',
        name: 'Test Product',
        price: -100
      }
      expect(validateProductQRData(negativePriceData)).toBe(false)
    })

    it('should handle zero price', () => {
      const zeroPriceData = {
        type: 'product',
        id: '123',
        sku: 'SKU001',
        name: 'Test Product',
        price: 0
      }
      expect(validateProductQRData(zeroPriceData)).toBe(false)
    })

    it('should handle empty string fields', () => {
      const emptyFieldsData = {
        type: 'product',
        id: '',
        sku: '',
        name: '',
        price: 100
      }
      expect(validateProductQRData(emptyFieldsData)).toBe(false)
    })

    it('should handle null/undefined fields', () => {
      const nullFieldsData = {
        type: 'product',
        id: null,
        sku: undefined,
        name: 'Test Product',
        price: 100
      }
      expect(validateProductQRData(nullFieldsData)).toBe(false)
    })

    it('should handle very long field values', () => {
      const longFieldsData = {
        type: 'product',
        id: 'A'.repeat(1000),
        sku: 'B'.repeat(1000),
        name: 'C'.repeat(1000),
        price: 100
      }
      expect(validateProductQRData(longFieldsData)).toBe(true)
    })

    it('should handle special characters in fields', () => {
      const specialCharsData = {
        type: 'product',
        id: 'id-123!@#',
        sku: 'SKU-001!@#',
        name: 'Product with "quotes" and \'apostrophes\'',
        price: 100.50
      }
      expect(validateProductQRData(specialCharsData)).toBe(true)
    })

    it('should handle unicode characters in fields', () => {
      const unicodeData = {
        type: 'product',
        id: '产品-123',
        sku: 'SKU-产品',
        name: '产品名称 🎉',
        price: 100
      }
      expect(validateProductQRData(unicodeData)).toBe(true)
    })

    it('should handle decimal prices', () => {
      const decimalPriceData = {
        type: 'product',
        id: '123',
        sku: 'SKU001',
        name: 'Test Product',
        price: 99.99
      }
      expect(validateProductQRData(decimalPriceData)).toBe(true)
    })

    it('should handle very large prices', () => {
      const largePriceData = {
        type: 'product',
        id: '123',
        sku: 'SKU001',
        name: 'Test Product',
        price: 999999999.99
      }
      expect(validateProductQRData(largePriceData)).toBe(true)
    })
  })

  describe('generateProductQRData - Edge Cases', () => {
    it('should handle null/undefined product', () => {
      expect(() => generateProductQRData(null as any)).toThrow()
      expect(() => generateProductQRData(undefined as any)).toThrow()
    })

    it('should handle product with missing required fields', () => {
      const incompleteProduct = {
        name: 'Test Product'
        // Missing _id, sku, price
      }
      
      expect(() => generateProductQRData(incompleteProduct as any)).toThrow()
    })

    it('should handle product with special characters', () => {
      const specialProduct = {
        _id: 'product-123!@#',
        name: 'Product with "quotes" and \'apostrophes\'',
        sku: 'SKU-001!@#',
        price: 99.99
      }
      
      const result = generateProductQRData(specialProduct as any)
      const parsed = JSON.parse(result)
      
      expect(parsed.type).toBe('product')
      expect(parsed.id).toBe('product-123!@#')
      expect(parsed.name).toBe('Product with "quotes" and \'apostrophes\'')
      expect(parsed.sku).toBe('SKU-001!@#')
      expect(parsed.price).toBe(99.99)
    })

    it('should handle product with unicode characters', () => {
      const unicodeProduct = {
        _id: '产品-123',
        name: '产品名称 🎉',
        sku: 'SKU-产品',
        price: 100
      }
      
      const result = generateProductQRData(unicodeProduct as any)
      const parsed = JSON.parse(result)
      
      expect(parsed.type).toBe('product')
      expect(parsed.id).toBe('产品-123')
      expect(parsed.name).toBe('产品名称 🎉')
      expect(parsed.sku).toBe('SKU-产品')
      expect(parsed.price).toBe(100)
    })
  })

  describe('generateProductQRCode - Edge Cases', () => {
    it('should handle QR generation errors', async () => {
      const product = {
        _id: 'product1',
        name: 'Test Product',
        sku: 'SKU001',
        price: 100
      }
      
      qrcode.toDataURL.mockRejectedValue(new Error('QR generation failed'))
      
      await expect(generateProductQRCode(product as any)).rejects.toThrow('Failed to generate QR code')
    })

    it('should handle invalid product data', async () => {
      const invalidProduct = {
        name: 'Test Product'
        // Missing required fields
      }
      
      expect(() => generateProductQRData(invalidProduct as any)).toThrow('Invalid product data: missing required fields')
    })

    it('should handle custom options', async () => {
      const product = {
        _id: 'product1',
        name: 'Test Product',
        sku: 'SKU001',
        price: 100
      }
      
      const customOptions = {
        width: 500,
        margin: 5
      }
      
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,custom-qr')
      
      const result = await generateProductQRCode(product as any, customOptions)
      
      expect(result).toBe('data:image/png;base64,custom-qr')
      expect(qrcode.toDataURL).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining(customOptions)
      )
    })
  })

  describe('Integration Edge Cases', () => {
    it('should handle complete workflow with edge case data', async () => {
      const edgeCaseProduct = {
        _id: '产品-123!@#',
        name: '产品名称 with "quotes" and \'apostrophes\' 🎉',
        sku: 'SKU-产品-001!@#',
        price: 99.99
      }
      
      // Generate QR data
      const qrData = generateProductQRData(edgeCaseProduct as any)
      expect(qrData).toBeDefined()
      
      // Parse QR data
      const parsedData = parseQRCodeData(qrData)
      expect(parsedData).toEqual({
        type: 'product',
        id: '产品-123!@#',
        name: '产品名称 with "quotes" and \'apostrophes\' 🎉',
        sku: 'SKU-产品-001!@#',
        price: 99.99
      })
      
      // Validate QR data
      const isValid = validateProductQRData(parsedData)
      expect(isValid).toBe(true)
      
      // Generate QR code
      qrcode.toDataURL.mockResolvedValue('data:image/png;base64,edge-case-qr')
      const qrCode = await generateProductQRCode(edgeCaseProduct as any)
      expect(qrCode).toBe('data:image/png;base64,edge-case-qr')
    })

    it('should handle malformed data in complete workflow', () => {
      const malformedData = '{"incomplete": json'
      
      const parsedData = parseQRCodeData(malformedData)
      expect(parsedData).toBeNull()
      
      const isValid = validateProductQRData(parsedData)
      expect(isValid).toBe(false)
    })
  })
})

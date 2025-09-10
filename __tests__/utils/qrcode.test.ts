import { generateQRCode, parseQRCodeData, validateProductQRData } from '@/utils/qrcode'

// Mock qrcode library
jest.mock('qrcode', () => ({
  toDataURL: jest.fn().mockResolvedValue('data:image/png;base64,mock-qr-code'),
  toString: jest.fn().mockResolvedValue('mock-qr-string'),
}))

describe('QR Code Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('generateQRCode', () => {
    it('should generate QR code with default options', async () => {
      const result = await generateQRCode('test-data')
      
      expect(result).toBe('data:image/png;base64,mock-qr-code')
    })

    it('should generate QR code with custom options', async () => {
      const options = {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }
      
      const result = await generateQRCode('test-data', options)
      
      expect(result).toBe('data:image/png;base64,mock-qr-code')
    })

    it('should handle errors gracefully', async () => {
      const qrcode = require('qrcode')
      qrcode.toDataURL.mockRejectedValueOnce(new Error('QR generation failed'))
      
      await expect(generateQRCode('test-data')).rejects.toThrow('Failed to generate QR code')
    })
  })

  describe('parseQRCodeData', () => {
    it('should parse valid QR code data', () => {
      const qrData = '{"type":"product","id":"12345","sku":"SKU123","name":"Test Product","price":10.99}'
      const result = parseQRCodeData(qrData)
      
      expect(result).toEqual({
        type: 'product',
        id: '12345',
        sku: 'SKU123',
        name: 'Test Product',
        price: 10.99
      })
    })

    it('should handle malformed QR code data', () => {
      const qrData = 'invalid-json'
      const result = parseQRCodeData(qrData)
      
      expect(result).toBeNull()
    })

    it('should handle empty QR code data', () => {
      const result = parseQRCodeData('')
      expect(result).toBeNull()
    })
  })

  describe('validateProductQRData', () => {
    it('should validate correct product QR data', () => {
      const data = {
        type: 'product',
        id: '12345',
        sku: 'SKU123',
        name: 'Test Product',
        price: 10.99
      }
      
      expect(validateProductQRData(data)).toBe(true)
    })

    it('should reject invalid product QR data', () => {
      const data = {
        type: 'product',
        id: '12345',
        // missing required fields
      }
      
      expect(validateProductQRData(data)).toBe(false)
    })

    it('should reject non-product data', () => {
      const data = {
        type: 'other',
        id: '12345',
        sku: 'SKU123',
        name: 'Test Product',
        price: 10.99
      }
      
      expect(validateProductQRData(data)).toBe(false)
    })
  })
})

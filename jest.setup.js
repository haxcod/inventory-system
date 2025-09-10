import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js headers
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}))

// Mock NextResponse
global.NextResponse = {
  json: (data, init) => Response.json(data, init),
  redirect: (url, init) => new Response(null, { ...init, status: 302, headers: { Location: url } }),
}

// Mock MongoDB with realistic database simulation
const mockDatabase = {
  users: new Map(),
  products: new Map(),
  categories: new Map(),
  branches: new Map(),
  transactions: new Map(),
  suppliers: new Map(),
}

// Helper functions for database operations
const dbHelpers = {
  findOne: (collection, query) => {
    const data = Array.from(mockDatabase[collection].values())
    return data.find(item => {
      return Object.keys(query).every(key => item[key] === query[key])
    }) || null
  },
  
  find: (collection, query = {}) => {
    const data = Array.from(mockDatabase[collection].values())
    if (Object.keys(query).length === 0) return data
    return data.filter(item => {
      return Object.keys(query).every(key => item[key] === query[key])
    })
  },
  
  insertOne: (collection, document) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newDoc = { _id: id, ...document, createdAt: new Date(), updatedAt: new Date() }
    mockDatabase[collection].set(id, newDoc)
    return { insertedId: id, acknowledged: true }
  },
  
  updateOne: (collection, filter, update) => {
    const item = dbHelpers.findOne(collection, filter)
    if (!item) return { matchedCount: 0, modifiedCount: 0, acknowledged: true }
    
    const updatedDoc = { ...item, ...update, updatedAt: new Date() }
    mockDatabase[collection].set(item._id, updatedDoc)
    return { matchedCount: 1, modifiedCount: 1, acknowledged: true }
  },
  
  deleteOne: (collection, filter) => {
    const item = dbHelpers.findOne(collection, filter)
    if (!item) return { deletedCount: 0, acknowledged: true }
    
    mockDatabase[collection].delete(item._id)
    return { deletedCount: 1, acknowledged: true }
  },
  
  countDocuments: (collection, query = {}) => {
    return dbHelpers.find(collection, query).length
  }
}

// Mock MongoDB
jest.mock('@/lib/mongodb', () => {
  const mockConnectDB = jest.fn().mockResolvedValue({
    db: jest.fn(() => ({
      collection: jest.fn((collectionName) => ({
        findOne: jest.fn((query) => Promise.resolve(dbHelpers.findOne(collectionName, query))),
        find: jest.fn((query) => Promise.resolve(dbHelpers.find(collectionName, query))),
        insertOne: jest.fn((document) => Promise.resolve(dbHelpers.insertOne(collectionName, document))),
        updateOne: jest.fn((filter, update) => Promise.resolve(dbHelpers.updateOne(collectionName, filter, update))),
        deleteOne: jest.fn((filter) => Promise.resolve(dbHelpers.deleteOne(collectionName, filter))),
        countDocuments: jest.fn((query) => Promise.resolve(dbHelpers.countDocuments(collectionName, query))),
      })),
    })),
  });
  
  return {
    default: mockConnectDB,
    __esModule: true,
  };
})

// Seed test data
beforeEach(() => {
  // Clear all collections
  Object.keys(mockDatabase).forEach(key => mockDatabase[key].clear())
  
  // Seed test users
  const testUsers = [
    {
      _id: 'user1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: 'admin',
      permissions: ['read:all', 'write:all', 'delete:all'],
      isActive: true,
      password: '$2a$12$hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'user2',
      email: 'manager@test.com',
      name: 'Manager User',
      role: 'manager',
      permissions: ['read:products', 'write:products', 'read:users'],
      isActive: true,
      password: '$2a$12$hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'user3',
      email: 'user@test.com',
      name: 'Regular User',
      role: 'user',
      permissions: ['read:products'],
      isActive: true,
      password: '$2a$12$hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'user4',
      email: 'inactive@test.com',
      name: 'Inactive User',
      role: 'user',
      permissions: ['read:products'],
      isActive: false,
      password: '$2a$12$hashedpassword',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  testUsers.forEach(user => {
    mockDatabase.users.set(user._id, user)
  })
  
  // Seed test products
  const testProducts = [
    {
      _id: 'product1',
      name: 'Test Product 1',
      sku: 'SKU001',
      price: 100.00,
      quantity: 50,
      category: 'Electronics',
      supplier: 'Test Supplier',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: 'product2',
      name: 'Test Product 2',
      sku: 'SKU002',
      price: 200.00,
      quantity: 0,
      category: 'Clothing',
      supplier: 'Test Supplier 2',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
  
  testProducts.forEach(product => {
    mockDatabase.products.set(product._id, product)
  })
})

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.MONGODB_URI = 'mongodb://localhost:27017/test'
process.env.JWT_SECRET = 'test-secret'

// Mock Web APIs for Node.js environment
global.Request = class Request {
  constructor(input, init) {
    const url = typeof input === 'string' ? input : input.url
    Object.defineProperty(this, 'url', {
      value: url,
      writable: false,
      enumerable: true,
      configurable: true
    })
    this.method = init?.method || 'GET'
    this.headers = new Headers(init?.headers)
    this.body = init?.body
    
    // Add json method
    this.json = async () => {
      if (typeof this.body === 'string') {
        return JSON.parse(this.body)
      }
      return this.body
    }
  }
}

global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.statusText = init?.statusText || 'OK'
    this.headers = new Headers(init?.headers)
  }
  
  async json() {
    return JSON.parse(this.body)
  }
  
  static json(data, init) {
    return new Response(JSON.stringify(data), {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    })
  }
}

global.Headers = class Headers {
  constructor(init) {
    this.map = new Map()
    if (init) {
      if (Array.isArray(init)) {
        init.forEach(([key, value]) => this.map.set(key.toLowerCase(), value))
      } else if (typeof init === 'object') {
        Object.entries(init).forEach(([key, value]) => this.map.set(key.toLowerCase(), value))
      }
    }
  }
  
  get(name) {
    return this.map.get(name.toLowerCase())
  }
  
  set(name, value) {
    this.map.set(name.toLowerCase(), value)
  }
  
  has(name) {
    return this.map.has(name.toLowerCase())
  }
  
  delete(name) {
    this.map.delete(name.toLowerCase())
  }
  
  *entries() {
    for (const [key, value] of this.map) {
      yield [key, value]
    }
  }
  
  *keys() {
    for (const key of this.map.keys()) {
      yield key
    }
  }
  
  *values() {
    for (const value of this.map.values()) {
      yield value
    }
  }
  
  forEach(callback, thisArg) {
    this.map.forEach(callback, thisArg)
  }
}

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})
global.localStorage = localStorageMock

// Mock speech recognition
Object.defineProperty(window, 'speechSynthesis', {
  writable: true,
  value: {
    speak: jest.fn(),
    cancel: jest.fn(),
    getVoices: jest.fn(() => []),
    onvoiceschanged: null,
  },
})

Object.defineProperty(window, 'SpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
})

Object.defineProperty(window, 'webkitSpeechRecognition', {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
})

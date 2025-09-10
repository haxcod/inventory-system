import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { AuthProvider } from '@/components/providers/AuthProvider'

// Mock React.createPortal for JSDOM
const mockPortal = jest.fn((children) => children)

// Mock React.createPortal directly - using function to avoid hoisting issues
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createPortal: jest.fn((children) => children),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn((children) => children),
}))

// Mock document.body for portal tests
Object.defineProperty(document, 'body', {
  value: document.createElement('body'),
  writable: true,
})

// Test wrapper with all necessary providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const mockUser = {
    id: '1',
    email: 'test@example.com',
    role: 'admin',
    permissions: ['read:all', 'write:all', 'delete:all'],
    branch: 'main'
  }

  return (
    <ThemeProvider>
      <AuthProvider initialUser={mockUser}>
        {children}
      </AuthProvider>
    </ThemeProvider>
  )
}

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Error boundary for testing error scenarios
class TestErrorBoundary extends React.Component<
  { children: React.ReactNode; onError?: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) {
      return <div data-testid="error-boundary">Something went wrong</div>
    }

    return this.props.children
  }
}

// Helper to create components that throw errors
const createErrorComponent = (error: Error) => {
  return () => {
    throw error
  }
}

// Mock console methods to avoid noise in tests
const mockConsole = {
  error: jest.fn(),
  warn: jest.fn(),
  log: jest.fn(),
}

// Setup console mocks
beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(mockConsole.error)
  jest.spyOn(console, 'warn').mockImplementation(mockConsole.warn)
  jest.spyOn(console, 'log').mockImplementation(mockConsole.log)
})

afterEach(() => {
  jest.restoreAllMocks()
})

export * from '@testing-library/react'
export { customRender as render, TestErrorBoundary, createErrorComponent, mockPortal }

import React from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Simple test wrapper without complex providers
const SimpleWrapper = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// Custom render function without providers for basic component tests
const simpleRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: SimpleWrapper, ...options })

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

// Mock portal for testing
const mockPortal = jest.fn((children) => children)

// Mock React.createPortal
jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn((children) => {
    mockPortal(children, document.body)
    return children
  }),
}))

export { simpleRender as render, TestErrorBoundary, createErrorComponent, mockPortal }

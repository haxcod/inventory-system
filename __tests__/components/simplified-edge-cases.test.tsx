import React from 'react'
import { screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/Button'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { render, TestErrorBoundary, createErrorComponent } from '../helpers/test-wrappers'

describe('Simplified Component Edge Cases', () => {
  describe('Button Component - Basic Edge Cases', () => {
    it('should handle null and undefined children', () => {
      render(<Button>{null}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
      
      render(<Button>{undefined}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle empty string children', () => {
      render(<Button>{''}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should handle different variants', () => {
      render(<Button variant="primary">Primary Button</Button>)
      expect(screen.getByText('Primary Button')).toBeInTheDocument()
      
      render(<Button variant="destructive">Destructive Button</Button>)
      expect(screen.getByText('Destructive Button')).toBeInTheDocument()
    })

    it('should handle different sizes', () => {
      render(<Button size="sm">Small Button</Button>)
      expect(screen.getByText('Small Button')).toBeInTheDocument()
      
      render(<Button size="lg">Large Button</Button>)
      expect(screen.getByText('Large Button')).toBeInTheDocument()
    })

    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Clickable Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not trigger click when disabled', () => {
      const handleClick = jest.fn()
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('ThemeProvider - Basic Edge Cases', () => {
    it('should render children', () => {
      render(
        <ThemeProvider>
          <div>Test Content</div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('should handle nested components', () => {
      render(
        <ThemeProvider>
          <div>
            <h1>Title</h1>
            <p>Content</p>
          </div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
    })
  })

  describe('Error Boundary - Basic Edge Cases', () => {
    it('should catch errors and display fallback', () => {
      const testError = new Error('Test error')
      const ErrorComponent = createErrorComponent(testError)
      const onError = jest.fn()
      
      render(
        <TestErrorBoundary onError={onError}>
          <ErrorComponent />
        </TestErrorBoundary>
      )
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(onError).toHaveBeenCalledWith(testError)
    })

    it('should render children when no error occurs', () => {
      const NormalComponent = () => <div>Normal content</div>
      
      render(
        <TestErrorBoundary>
          <NormalComponent />
        </TestErrorBoundary>
      )
      
      expect(screen.getByText('Normal content')).toBeInTheDocument()
      expect(screen.queryByTestId('error-boundary')).not.toBeInTheDocument()
    })
  })

  describe('Component Integration - Basic Edge Cases', () => {
    it('should handle Button inside ThemeProvider', () => {
      render(
        <ThemeProvider>
          <Button>Theme Button</Button>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Theme Button')).toBeInTheDocument()
    })

    it('should handle multiple Buttons with different states', () => {
      render(
        <ThemeProvider>
          <div>
            <Button>Normal Button</Button>
            <Button disabled>Disabled Button</Button>
            <Button variant="destructive">Danger Button</Button>
            <Button size="lg">Large Button</Button>
          </div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Normal Button')).toBeInTheDocument()
      expect(screen.getByText('Disabled Button')).toBeDisabled()
      expect(screen.getByText('Danger Button')).toBeInTheDocument()
      expect(screen.getByText('Large Button')).toBeInTheDocument()
    })

    it('should handle form with multiple Buttons', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      const handleReset = jest.fn((e) => e.preventDefault())
      
      render(
        <ThemeProvider>
          <form onSubmit={handleSubmit}>
            <Button type="submit">Submit</Button>
            <Button type="reset" onClick={handleReset}>Reset</Button>
            <Button type="button">Cancel</Button>
          </form>
        </ThemeProvider>
      )
      
      const submitButton = screen.getByText('Submit')
      const resetButton = screen.getByText('Reset')
      const cancelButton = screen.getByText('Cancel')
      
      expect(submitButton).toBeInTheDocument()
      expect(resetButton).toBeInTheDocument()
      expect(cancelButton).toBeInTheDocument()
      
      fireEvent.click(submitButton)
      fireEvent.click(resetButton)
      fireEvent.click(cancelButton)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      expect(handleReset).toHaveBeenCalledTimes(1)
    })
  })
})

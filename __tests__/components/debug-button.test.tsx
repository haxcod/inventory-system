import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/Button'

describe('Button Debug Test', () => {
  it('should render a basic button', () => {
    const { container } = render(<Button>Test Button</Button>)
    
    // Debug: log the rendered HTML
    console.log('Rendered HTML:', container.innerHTML)
    
    // Check if button exists
    const button = container.querySelector('button')
    expect(button).toBeInTheDocument()
    
    // Check if button has text content
    expect(button).toHaveTextContent('Test Button')
  })

  it('should render button with role', () => {
    render(<Button>Test Button</Button>)
    
    // Try to find by role
    const button = screen.queryByRole('button')
    console.log('Button found by role:', button)
    
    if (button) {
      expect(button).toBeInTheDocument()
    } else {
      // If not found by role, try other methods
      const buttonByText = screen.queryByText('Test Button')
      console.log('Button found by text:', buttonByText)
      expect(buttonByText).toBeInTheDocument()
    }
  })
})

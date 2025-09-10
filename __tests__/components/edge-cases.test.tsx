import React from 'react'
import { createPortal } from 'react-dom'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/Button'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { render, TestErrorBoundary, createErrorComponent, mockPortal } from '../helpers/simple-test-wrappers'

describe('Component Edge Cases and Error Handling', () => {
  describe('Button Component - Edge Cases', () => {
    it('should handle null and undefined children', () => {
      const { unmount } = render(<Button>{null}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
      unmount()
      
      render(<Button>{undefined}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle empty string children', () => {
      render(<Button>{''}</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should handle very long text content', () => {
      const longText = 'A'.repeat(1000)
      render(<Button>{longText}</Button>)
      expect(screen.getByRole('button')).toHaveTextContent(longText)
    })

    it('should handle special characters in children', () => {
      const specialText = 'Button with "quotes" and \'apostrophes\' and symbols !@#$%^&*()'
      render(<Button>{specialText}</Button>)
      expect(screen.getByRole('button')).toHaveTextContent(specialText)
    })

    it('should handle unicode characters in children', () => {
      const unicodeText = '按钮 with 中文 and emoji 🎉🚀'
      render(<Button>{unicodeText}</Button>)
      expect(screen.getByRole('button')).toHaveTextContent(unicodeText)
    })

    it('should handle multiple children elements', () => {
      render(
        <Button>
          <span>Icon</span>
          <span>Text</span>
        </Button>
      )
      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('Icon')).toBeInTheDocument()
      expect(screen.getByText('Text')).toBeInTheDocument()
    })

    it('should handle disabled state with click events', () => {
      const handleClick = jest.fn()
      render(<Button disabled onClick={handleClick}>Disabled Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      
      fireEvent.click(button)
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('should handle disabled state', () => {
      render(<Button disabled>Disabled Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('should handle custom className with conflicting styles', () => {
      render(<Button className="bg-red-500 text-white">Custom Button</Button>)
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-500', 'text-white')
    })

    it('should handle all button variants', () => {
      const variants = ['primary', 'secondary', 'destructive', 'outline', 'ghost', 'link'] as const
      
      variants.forEach(variant => {
        const { unmount } = render(<Button variant={variant}>{variant} Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        unmount()
      })
    })

    it('should handle all button sizes', () => {
      const sizes = ['sm', 'default', 'lg', 'icon'] as const
      
      sizes.forEach(size => {
        const { unmount } = render(<Button size={size}>{size} Button</Button>)
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        unmount()
      })
    })

    it('should handle rapid clicking', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Rapid Click Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        fireEvent.click(button)
      }
      
      expect(handleClick).toHaveBeenCalledTimes(10)
    })

    it('should handle keyboard events', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Keyboard Button</Button>)
      
      const button = screen.getByRole('button')
      
      // Test that keyboard events don't automatically trigger clicks
      // (Button component doesn't handle keyboard events by default)
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
      fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' })
      
      // No clicks should be triggered by keyboard events
      expect(handleClick).toHaveBeenCalledTimes(0)
    })

    it('should handle focus and blur events', () => {
      const handleFocus = jest.fn()
      const handleBlur = jest.fn()
      
      render(
        <Button onFocus={handleFocus} onBlur={handleBlur}>
          Focus Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      
      fireEvent.focus(button)
      expect(handleFocus).toHaveBeenCalledTimes(1)
      
      fireEvent.blur(button)
      expect(handleBlur).toHaveBeenCalledTimes(1)
    })

    it('should handle mouse events', () => {
      const handleMouseEnter = jest.fn()
      const handleMouseLeave = jest.fn()
      const handleMouseDown = jest.fn()
      const handleMouseUp = jest.fn()
      
      render(
        <Button
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          Mouse Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      
      fireEvent.mouseEnter(button)
      expect(handleMouseEnter).toHaveBeenCalledTimes(1)
      
      fireEvent.mouseLeave(button)
      expect(handleMouseLeave).toHaveBeenCalledTimes(1)
      
      fireEvent.mouseDown(button)
      expect(handleMouseDown).toHaveBeenCalledTimes(1)
      
      fireEvent.mouseUp(button)
      expect(handleMouseUp).toHaveBeenCalledTimes(1)
    })

    it('should handle form submission', () => {
      const handleSubmit = jest.fn((e) => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Button</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      
      fireEvent.click(button)
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should handle ref forwarding', () => {
      const ref = React.createRef<HTMLButtonElement>()
      render(<Button ref={ref}>Ref Button</Button>)
      
      expect(ref.current).toBeInstanceOf(HTMLButtonElement)
      expect(ref.current).toHaveTextContent('Ref Button')
    })

    it('should handle data attributes', () => {
      render(
        <Button data-testid="custom-button" data-custom="value">
          Data Button
        </Button>
      )
      
      const button = screen.getByTestId('custom-button')
      expect(button).toHaveAttribute('data-custom', 'value')
    })

    it('should handle aria attributes', () => {
      render(
        <Button
          aria-label="Custom button label"
          aria-describedby="button-description"
          aria-pressed="false"
        >
          Aria Button
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Custom button label')
      expect(button).toHaveAttribute('aria-describedby', 'button-description')
      expect(button).toHaveAttribute('aria-pressed', 'false')
    })
  })

  describe('ThemeProvider Component - Edge Cases', () => {
    it('should handle null and undefined children', () => {
      render(<ThemeProvider>{null}</ThemeProvider>)
      expect(document.documentElement).toBeInTheDocument()
      
      render(<ThemeProvider>{undefined}</ThemeProvider>)
      expect(document.documentElement).toBeInTheDocument()
    })

    it('should handle multiple nested ThemeProviders', () => {
      render(
        <ThemeProvider>
          <div>
            <ThemeProvider>
              <div>Nested Content</div>
            </ThemeProvider>
          </div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Nested Content')).toBeInTheDocument()
    })

    it('should handle theme switching with rapid changes', async () => {
      const TestComponent = () => {
        const [theme, setTheme] = React.useState('light')
        
        return (
          <ThemeProvider>
            <div>
              <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Toggle Theme
              </button>
              <div data-testid="theme-display">{theme}</div>
            </div>
          </ThemeProvider>
        )
      }
      
      render(<TestComponent />)
      
      const toggleButton = screen.getByText('Toggle Theme')
      const themeDisplay = screen.getByTestId('theme-display')
      
      // Rapid theme switching
      for (let i = 0; i < 5; i++) {
        fireEvent.click(toggleButton)
        await waitFor(() => {
          expect(themeDisplay).toHaveTextContent(i % 2 === 0 ? 'dark' : 'light')
        })
      }
    })

    it('should handle theme persistence across re-renders', () => {
      const { rerender } = render(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
      
      // Re-render with same content
      rerender(
        <ThemeProvider>
          <div>Content</div>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Content')).toBeInTheDocument()
    })

    it('should handle theme with complex nested components', () => {
      const ComplexComponent = () => (
        <div>
          <header>
            <nav>
              <ul>
                <li>Item 1</li>
                <li>Item 2</li>
              </ul>
            </nav>
          </header>
          <main>
            <section>
              <article>
                <h1>Title</h1>
                <p>Content</p>
              </article>
            </section>
          </main>
          <footer>
            <p>Footer</p>
          </footer>
        </div>
      )
      
      render(
        <ThemeProvider>
          <ComplexComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByText('Title')).toBeInTheDocument()
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByText('Footer')).toBeInTheDocument()
    })

    it('should handle theme with conditional rendering', () => {
      const ConditionalComponent = ({ show }: { show: boolean }) => (
        <div>
          {show && <div>Conditional Content</div>}
          <div>Always Visible</div>
        </div>
      )
      
      const { rerender } = render(
        <ThemeProvider>
          <ConditionalComponent show={true} />
        </ThemeProvider>
      )
      
      expect(screen.getByText('Conditional Content')).toBeInTheDocument()
      expect(screen.getByText('Always Visible')).toBeInTheDocument()
      
      rerender(
        <ThemeProvider>
          <ConditionalComponent show={false} />
        </ThemeProvider>
      )
      
      expect(screen.queryByText('Conditional Content')).not.toBeInTheDocument()
      expect(screen.getByText('Always Visible')).toBeInTheDocument()
    })

    it('should handle theme with error boundaries', () => {
      const testError = new Error('Test error')
      const ErrorComponent = createErrorComponent(testError)
      const onError = jest.fn()
      
      render(
        <ThemeProvider>
          <TestErrorBoundary onError={onError}>
            <ErrorComponent />
          </TestErrorBoundary>
        </ThemeProvider>
      )
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    })

    it('should handle theme with async components', async () => {
      const AsyncComponent = () => {
        const [data, setData] = React.useState<string | null>(null)
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setData('Async data loaded')
          }, 100)
          
          return () => clearTimeout(timer)
        }, [])
        
        return <div>{data || 'Loading...'}</div>
      }
      
      render(
        <ThemeProvider>
          <AsyncComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      
      await waitFor(() => {
        expect(screen.getByText('Async data loaded')).toBeInTheDocument()
      })
    })

    it('should handle theme with context providers', () => {
      const TestContext = React.createContext<string>('default')
      
      const ContextComponent = () => {
        const value = React.useContext(TestContext)
        return <div>Context value: {value}</div>
      }
      
      render(
        <ThemeProvider>
          <TestContext.Provider value="test-value">
            <ContextComponent />
          </TestContext.Provider>
        </ThemeProvider>
      )
      
      expect(screen.getByText('Context value: test-value')).toBeInTheDocument()
    })

    it('should handle theme with portals', () => {
      const PortalComponent = () => {
        const [mounted, setMounted] = React.useState(false)
        
        React.useEffect(() => {
          setMounted(true)
        }, [])
        
        if (!mounted) return null
        
        return createPortal(
          <div>Portal content</div>,
          document.body
        )
      }
      
      render(
        <ThemeProvider>
          <PortalComponent />
        </ThemeProvider>
      )
      
      expect(screen.getByText('Portal content')).toBeInTheDocument()
      // Portal content should be rendered in the document
      expect(document.body).toHaveTextContent('Portal content')
    })
  })

  describe('Component Integration Edge Cases', () => {
    it('should handle Button inside ThemeProvider with theme changes', () => {
      const TestComponent = () => {
        const [theme, setTheme] = React.useState('light')
        
        return (
          <ThemeProvider>
            <div>
              <Button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                Current theme: {theme}
              </Button>
            </div>
          </ThemeProvider>
        )
      }
      
      render(<TestComponent />)
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Current theme: light')
      
      fireEvent.click(button)
      expect(button).toHaveTextContent('Current theme: dark')
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
      
      expect(submitButton).toHaveAttribute('type', 'submit')
      expect(resetButton).toHaveAttribute('type', 'reset')
      expect(cancelButton).toHaveAttribute('type', 'button')
      
      fireEvent.click(submitButton)
      expect(handleSubmit).toHaveBeenCalledTimes(1)
      
      fireEvent.click(resetButton)
      expect(handleReset).toHaveBeenCalledTimes(1)
    })
  })
})

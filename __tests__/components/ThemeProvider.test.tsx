import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider'

// Test component that uses the theme
function TestComponent() {
  const { theme, toggleTheme, setTheme } = useTheme()
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
      <button onClick={() => setTheme('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setTheme('light')} data-testid="set-light">
        Set Light
      </button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should provide default light theme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })

  it('should toggle theme when toggle button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const toggleButton = screen.getByTestId('toggle-theme')
    fireEvent.click(toggleButton)
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
  })

  it('should set theme to dark when set dark button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const setDarkButton = screen.getByTestId('set-dark')
    fireEvent.click(setDarkButton)
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark')
  })

  it('should set theme to light when set light button is clicked', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const setLightButton = screen.getByTestId('set-light')
    fireEvent.click(setLightButton)
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light')
  })

  it('should persist theme in localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )
    
    const toggleButton = screen.getByTestId('toggle-theme')
    fireEvent.click(toggleButton)
    
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })
})

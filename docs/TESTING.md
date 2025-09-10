# Testing Framework Documentation

## Overview

This document provides comprehensive guidance for the testing framework of the Inventory Management System. The framework includes unit tests, integration tests, end-to-end tests, and specialized edge case testing.

## Table of Contents

- [Testing Architecture](#testing-architecture)
- [Test Categories](#test-categories)
- [Setup and Configuration](#setup-and-configuration)
- [Running Tests](#running-tests)
- [Writing Tests](#writing-tests)
- [Edge Cases and Error Handling](#edge-cases-and-error-handling)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Testing Architecture

### Test Structure

```
__tests__/
├── components/           # React component tests
│   ├── Button.test.tsx
│   ├── ThemeProvider.test.tsx
│   └── edge-cases.test.tsx
├── lib/                 # Utility and library tests
│   ├── auth.test.ts
│   ├── auth-edge-cases.test.ts
│   └── permissions.test.ts
├── utils/               # Utility function tests
│   ├── qrcode.test.ts
│   └── qrcode-edge-cases.test.ts
├── api/                 # API integration tests
│   ├── auth/
│   │   ├── login.test.ts
│   │   └── login-comprehensive.test.ts
│   └── products.test.ts
└── e2e/                 # End-to-end tests
    ├── auth.spec.ts
    ├── products.spec.ts
    └── inventory.spec.ts
```

### Testing Stack

- **Jest**: Unit and integration testing
- **React Testing Library**: Component testing
- **Playwright**: End-to-end testing
- **Custom MongoDB Mock**: Realistic database simulation
- **GitHub Actions**: CI/CD pipeline

## Test Categories

### 1. Unit Tests

Test individual functions, components, and utilities in isolation.

**Location**: `__tests__/components/`, `__tests__/lib/`, `__tests__/utils/`

**Examples**:
- Button component rendering and behavior
- Auth utility functions (hashPassword, verifyPassword, etc.)
- QR code generation and validation

### 2. Integration Tests

Test API endpoints and database interactions.

**Location**: `__tests__/api/`

**Examples**:
- Login API endpoint with various scenarios
- Product CRUD operations
- Permission-based access control

### 3. Edge Case Tests

Comprehensive testing of error conditions and boundary cases.

**Location**: `__tests__/*/edge-cases.test.*`

**Examples**:
- Null/undefined input handling
- Very large data processing
- Special character handling
- Network error simulation

### 4. Permission Tests

Role-based access control and security testing.

**Location**: `__tests__/lib/permissions.test.ts`

**Examples**:
- Admin, manager, and user permission levels
- Branch access control
- Resource-specific permissions

### 5. End-to-End Tests

Full user workflow testing with real browser interactions.

**Location**: `__tests__/e2e/`

**Examples**:
- Complete login flow
- Product management workflow
- Inventory operations

## Setup and Configuration

### Prerequisites

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Jest Configuration

The Jest configuration is defined in `jest.config.js`:

```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    'utils/**/*.{js,jsx,ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
}
```

### MongoDB Mock Setup

The enhanced MongoDB mock provides realistic database simulation:

```javascript
// Realistic database operations
const mockDatabase = {
  users: new Map(),
  products: new Map(),
  categories: new Map(),
  // ... other collections
}

// Helper functions for CRUD operations
const dbHelpers = {
  findOne: (collection, query) => { /* ... */ },
  find: (collection, query) => { /* ... */ },
  insertOne: (collection, document) => { /* ... */ },
  updateOne: (collection, filter, update) => { /* ... */ },
  deleteOne: (collection, filter) => { /* ... */ },
}
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test categories
npm run test:unit
npm run test:integration
npm run test:edge-cases
npm run test:permissions

# Run E2E tests
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:headed
```

### CI/CD Commands

```bash
# Run tests for CI
npm run test:ci

# Run all test types
npm run test:all

# Security audit
npm run audit:check

# Type checking
npm run type-check

# Linting
npm run lint
```

## Writing Tests

### Component Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import Button from '@/components/Button'

describe('Button Component', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should handle click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API Testing

```typescript
import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/login/route'

describe('/api/auth/login', () => {
  it('should login successfully with valid credentials', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })
})
```

### Edge Case Testing

```typescript
describe('Edge Cases', () => {
  it('should handle null input gracefully', () => {
    expect(validateProductQRData(null)).toBe(false)
  })

  it('should handle very large data', async () => {
    const largeData = 'A'.repeat(10000)
    const result = await generateQRCode(largeData)
    expect(result).toBeDefined()
  })

  it('should handle special characters', () => {
    const specialData = 'Hello "world" with \'quotes\' and symbols !@#$%'
    const result = generateProductQRData(specialData)
    expect(result).toBeDefined()
  })
})
```

## Edge Cases and Error Handling

### Input Validation

- **Null/undefined inputs**: All functions should handle gracefully
- **Empty strings**: Appropriate validation and error messages
- **Special characters**: Unicode, quotes, symbols
- **Very large inputs**: Memory and performance considerations
- **Malformed data**: JSON parsing, data structure validation

### Error Scenarios

- **Network errors**: Database connection failures
- **Authentication errors**: Invalid credentials, expired tokens
- **Permission errors**: Insufficient access rights
- **Validation errors**: Invalid input data
- **System errors**: Memory, timeout, resource exhaustion

### Security Testing

- **SQL injection**: Input sanitization
- **XSS attacks**: Output encoding
- **CSRF protection**: Token validation
- **Rate limiting**: Request throttling
- **Data exposure**: Sensitive information protection

## CI/CD Integration

### GitHub Actions Workflow

The CI/CD pipeline includes:

1. **Test Execution**: Unit, integration, and E2E tests
2. **Security Scanning**: Dependency audit and vulnerability checks
3. **Code Quality**: Linting, type checking, and formatting
4. **Coverage Reporting**: Code coverage analysis and reporting
5. **Performance Testing**: Bundle analysis and performance metrics
6. **Deployment**: Preview deployments for pull requests

### Workflow Triggers

- **Push to main/develop**: Full test suite execution
- **Pull requests**: Comprehensive testing and security checks
- **Scheduled**: Regular security and dependency updates

### Coverage Requirements

- **Branches**: 80% coverage
- **Functions**: 80% coverage
- **Lines**: 80% coverage
- **Statements**: 80% coverage

## Best Practices

### Test Organization

1. **Group related tests**: Use `describe` blocks for logical grouping
2. **Clear test names**: Descriptive test descriptions
3. **Arrange-Act-Assert**: Follow the AAA pattern
4. **One assertion per test**: Focus on single behavior
5. **Independent tests**: Tests should not depend on each other

### Mocking Strategy

1. **Mock external dependencies**: Database, APIs, file system
2. **Use realistic data**: Test with production-like data
3. **Reset mocks**: Clear mocks between tests
4. **Verify interactions**: Check mock function calls
5. **Avoid over-mocking**: Test real behavior when possible

### Error Handling

1. **Test error conditions**: Both expected and unexpected errors
2. **Verify error messages**: Check error content and format
3. **Test recovery**: Ensure system recovers from errors
4. **Log error details**: Proper error logging and monitoring
5. **User-friendly messages**: Clear error messages for users

### Performance Considerations

1. **Test performance**: Include performance tests for critical paths
2. **Memory usage**: Monitor memory consumption in tests
3. **Timeout handling**: Set appropriate timeouts for async operations
4. **Resource cleanup**: Clean up resources after tests
5. **Parallel execution**: Run tests in parallel when possible

## Troubleshooting

### Common Issues

#### Test Failures

```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- Button.test.tsx
```

#### MongoDB Mock Issues

```bash
# Check mock setup
console.log(mockDatabase.users.size)

# Verify mock data
expect(mockDatabase.users.has('user1')).toBe(true)
```

#### E2E Test Issues

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests with debug mode
npm run test:e2e:headed

# Check test results
npx playwright show-report
```

#### Coverage Issues

```bash
# Generate detailed coverage report
npm run test:coverage

# Check coverage thresholds
npm test -- --coverage --coverageThreshold='{"global":{"branches":80}}'
```

### Debugging Tips

1. **Use console.log**: Add logging for debugging
2. **Breakpoints**: Use debugger statements
3. **Test isolation**: Run individual tests
4. **Mock verification**: Check mock function calls
5. **Error inspection**: Examine error objects and stack traces

### Performance Optimization

1. **Parallel testing**: Use `--maxWorkers` option
2. **Test selection**: Run only changed tests
3. **Mock optimization**: Reduce mock complexity
4. **Resource cleanup**: Proper cleanup after tests
5. **Cache utilization**: Use Jest's caching features

## Contributing

### Adding New Tests

1. **Follow naming conventions**: Use descriptive test names
2. **Include edge cases**: Test boundary conditions
3. **Update documentation**: Document new test patterns
4. **Maintain coverage**: Ensure adequate test coverage
5. **Review test quality**: Peer review test implementations

### Test Review Checklist

- [ ] Tests are focused and test single behavior
- [ ] Edge cases are covered
- [ ] Error conditions are tested
- [ ] Mocks are appropriate and realistic
- [ ] Test names are descriptive
- [ ] Tests are independent and can run in any order
- [ ] Performance implications are considered
- [ ] Security aspects are tested

## Scheduled Test Runs

### Nightly Test Execution
```bash
# Run comprehensive test suite nightly
npm run test:all
npm run test:performance
npm run test:accessibility
npm run test:visual
```

### CI/CD Pipeline Integration
- **GitHub Actions**: Automated testing on every push
- **Scheduled Runs**: Nightly comprehensive test execution
- **Artifact Storage**: Test reports and coverage data
- **Notification System**: Slack/Discord alerts for failures

### Test Execution Schedule
- **Unit Tests**: Every push to any branch
- **Integration Tests**: Every push to main/develop
- **E2E Tests**: Every push to main/develop
- **Performance Tests**: Nightly at 2 AM UTC
- **Accessibility Tests**: Weekly on Sundays
- **Visual Regression**: Every push to main

## Debugging Strategies

### Test Failure Analysis
1. **Check Test Logs**: Review detailed error messages
2. **Isolate Failing Tests**: Run individual test files
3. **Verify Dependencies**: Ensure all mocks are properly set up
4. **Check Environment**: Verify test environment configuration

### Common Debugging Commands
```bash
# Run specific test file
npm test -- --testPathPattern="specific-test-file"

# Run tests with verbose output
npm test -- --verbose

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Debug specific test
npm test -- --testNamePattern="specific test name"
```

### Performance Debugging
```bash
# Run performance tests
npm run test:performance

# Check memory usage
npm test -- --detectLeaks

# Profile test execution
npm test -- --profile
```

### E2E Test Debugging
```bash
# Run E2E tests in headed mode
npm run test:e2e:headed

# Run E2E tests with UI
npm run test:e2e:ui

# Debug specific E2E test
npx playwright test specific-test.spec.ts --debug
```

## Test Maintenance

### Regular Maintenance Tasks
- **Weekly**: Review and update test data
- **Monthly**: Update test dependencies
- **Quarterly**: Review and refactor test structure
- **Annually**: Comprehensive test framework review

### Test Data Management
- **Seed Data**: Keep test data up to date
- **Mock Data**: Ensure mocks reflect current API
- **Test Fixtures**: Maintain consistent test fixtures
- **Database State**: Reset test database regularly

### Performance Optimization
- **Parallel Execution**: Run tests in parallel when possible
- **Test Selection**: Use test patterns to run relevant tests
- **Mock Optimization**: Optimize mock implementations
- **Resource Cleanup**: Ensure proper cleanup after tests

## Production Deployment Checklist

### Pre-Deployment Testing
- [ ] All unit tests pass (`npm run test:unit`)
- [ ] All integration tests pass (`npm run test:integration`)
- [ ] All E2E tests pass (`npm run test:e2e`)
- [ ] Performance tests meet thresholds (`npm run test:performance`)
- [ ] Accessibility tests pass (`npm run test:accessibility`)
- [ ] Visual regression tests pass (`npm run test:visual`)
- [ ] Coverage meets minimum threshold (80%+)
- [ ] Security audit passes (`npm run audit:check`)

### Notification Setup
- [ ] Slack webhook configured (`SLACK_WEBHOOK_URL`)
- [ ] Discord webhook configured (`DISCORD_WEBHOOK_URL`)
- [ ] Codecov token configured (`CODECOV_TOKEN`)
- [ ] Test result notifications working
- [ ] Nightly test monitoring active

### Monitoring Configuration
- [ ] Artifact storage configured
- [ ] Test result analysis scripts working
- [ ] Performance monitoring active
- [ ] Coverage tracking enabled
- [ ] Failure alerting configured

## Troubleshooting Common Issues

### Test Failures
1. **Mock Issues**: Check mock implementations and ensure they match actual API
2. **Timing Issues**: Add appropriate waits and timeouts
3. **Environment Issues**: Verify test environment configuration
4. **Data Issues**: Check test data setup and cleanup

### Performance Issues
1. **Slow Tests**: Profile and optimize slow test cases
2. **Memory Leaks**: Check for proper cleanup in tests
3. **Resource Usage**: Monitor CPU and memory usage during tests
4. **Timeout Issues**: Adjust timeout settings appropriately

### Coverage Issues
1. **Low Coverage**: Add tests for uncovered code paths
2. **Coverage Gaps**: Identify and test edge cases
3. **Dead Code**: Remove unused code or add tests for it
4. **Integration Coverage**: Ensure API endpoints are tested

### CI/CD Issues
1. **Build Failures**: Check environment and dependency issues
2. **Test Timeouts**: Adjust timeout settings for CI environment
3. **Artifact Issues**: Verify artifact storage configuration
4. **Notification Issues**: Check webhook configuration and permissions

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Mocking Strategies](https://jestjs.io/docs/mock-functions)

---

For questions or issues with the testing framework, please refer to the troubleshooting section or create an issue in the project repository.

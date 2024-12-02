# Ecommerce API Tests

## Overview
This directory contains comprehensive test suites for the Ecommerce API, using Node.js native test runner and Supertest for HTTP assertions.

## Test Environment
- **Node.js Version**: Compatible with Node.js 18+ (native test runner support)
- **Test Database**: Uses a separate test database to prevent data pollution
- **Environment Variables**: 
  - `TEST_DB_URL`: Connection string for test database
  - `TEST_JWT_SECRET`: Unique secret for test authentication
  - `NODE_ENV`: Set to `test` during test execution

## Test Files
- `auth.test.js`: Authentication-related tests
  - User registration
  - Email verification
  - Login/Logout
  - Password reset

- `order.test.js`: Order-related tests
  - Order creation
  - Order retrieval
  - Order management

- `product.test.js`: Product-related tests
  - Product creation
  - Product listing
  - Product updates
  - Product deletion

- `review.test.js`: Review-related tests
  - Review submission
  - Review retrieval
  - Review management

- `user.test.js`: User profile and management tests

## Testing Framework
- **Test Runner**: Node.js native test runner
- **HTTP Testing**: Supertest
- **Assertion Library**: Node.js native assert

## Running Tests
```bash
# Run specific test file
npm test -- tests/auth.test.js
npm test -- tests/product.test.js
npm test -- tests/review.test.js
npm test -- tests/user.test.js
npm test -- tests/order.test.js
```

## Test Configuration
- Configuration file: `tests/config.js`
- Manages test environment settings
- Handles test database connection
- Provides utility functions for test setup

## Best Practices
1. Each test file focuses on a specific domain/resource
2. Use `beforeEach` for test setup and data reset
3. Test both successful and failure scenarios
4. Use descriptive test names
5. Ensure tests are isolated and independent

## Test Coverage
- Aim for comprehensive coverage of API endpoints
- Test various input scenarios
- Validate response status codes
- Use code coverage tools to identify untested code paths

## Debugging Tests
- Use `console.log()` or debug flags sparingly
- Leverage Node.js inspector for detailed debugging
- Check test output for detailed error information


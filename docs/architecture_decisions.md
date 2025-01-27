# Architecture Decisions

## Testing Tools

### Unit Testing (Vitest)
We chose Vitest for unit testing because:
- Fast execution with native TypeScript support
- Compatible with React Testing Library
- Shares similar API with Jest for familiar testing patterns
- Hot Module Reload (HMR) support for faster development

### End-to-End Testing (Playwright)
We chose Playwright for E2E testing because:
- Cross-browser testing with focus on Safari
- Built-in support for modern web features
- Powerful debugging capabilities
- Strong TypeScript support
- Ability to test both development and production environments

## Project Structure

### Documentation (`/docs`)
```
docs/
├── architecture_decisions.md   # Testing architecture decisions
├── test_coverage.md           # Test coverage tracking
└── README.md                  # Project overview
```
Central location for project documentation, making it easy for new developers to understand the testing approach.

### Unit and Integration Tests (`/src/__tests__`)
```
src/__tests__/
├── components/                # Component-level unit tests
│   └── AuthComponent/        
│       ├── AuthenticatedView.test.tsx    # Tests auth state
│       └── UnauthenticatedView.test.tsx  # Tests unauth state
├── integration/              # Integration tests with mocks
│   └── auth/
│       ├── auth-flow.test.tsx           # Auth flow testing
│       └── user-lifecycle.test.tsx      # User lifecycle testing
└── mocks/                    # Mock implementations
    └── auth/
        ├── amplify/         # AWS Amplify service mocks
        │   ├── authentication/
        │   ├── registration/
        │   └── user/
        ├── authenticator/    # UI component mocks
        │   ├── components/
        │   ├── context/
        │   └── hooks/
        └── types/
```

#### Component Tests
- Focused on isolated component behavior
- Separate tests for different authentication states
- Uses React Testing Library for component interaction

#### Integration Tests
- Tests multiple components working together
- Uses mocked services for predictable behavior
- Verifies complex user flows

#### Mocks
- Structured to mirror actual service architecture
- Separate mocks for AWS services and UI components
- Includes type definitions for type safety

### End-to-End Tests (`/e2e`)
```
e2e/
├── auth/
│   ├── flows/              # User journey tests
│   │   ├── valid/         # Happy path scenarios
│   │   │   ├── sign-in-flow.spec.ts
│   │   │   ├── sign-up-flow.spec.ts
│   │   │   ├── sign-out-flow.spec.ts
│   │   │   └── account-deletion-flow.spec.ts
│   │   └── invalid/       # Error scenarios
│   │       ├── sign-in-validation.spec.ts
│   │       └── sign-up-validation.spec.ts
│   └── views/             # Page-level tests
│       ├── authenticated.spec.ts
│       └── unauthenticated.spec.ts
├── utils/                 # Test helpers
│   ├── auth/
│   │   └── form/         # Form interactions
│   │       ├── click-*.ts    # Click actions
│   │       ├── fill-*.ts     # Form filling
│   │       └── index.ts      # Exports
│   └── toast/            # Toast verifications
│       ├── error.ts
│       ├── info.ts
│       ├── success.ts
│       └── index.ts
└── fixtures/             # Test data
    └── user/
        ├── valid.json    # Valid credentials
        └── invalid/      # Invalid test cases
            ├── deleted.json
            ├── invalid-password.json
            └── malformed.json
```

#### Flows
- Separated into valid and invalid paths
- Each flow focuses on a specific user journey
- Clear separation of concerns for easier maintenance

#### Views
- Tests for page-level functionality
- Verifies correct rendering and interactions
- Focuses on user-visible behavior

#### Utils
- Reusable helper functions
- Form interaction utilities
- Toast notification verification
- No navigation helpers to keep tests close to user behavior

#### Fixtures
- Structured test data
- Separate valid and invalid cases
- JSON format for easy maintenance

### Reports and Scripts
```
playwright-report/          # E2E test reports
scripts/                   # Test utility scripts
```
- Automated test reporting
- Helper scripts for test setup and maintenance

## Key Principles

1. **Separation of Concerns**
   - Clear distinction between unit, integration, and E2E tests
   - Organized folder structure reflecting test purposes
   - Modular utilities and fixtures

2. **Test Data Management**
   - Centralized fixtures
   - Clear separation of valid and invalid test cases
   - Reusable test data across different test types

3. **Code Organization**
   - Consistent naming conventions
   - Logical grouping of related tests
   - Shared utilities for common operations

4. **Maintainability**
   - Small, focused test files
   - Reusable helper functions
   - Clear documentation and structure

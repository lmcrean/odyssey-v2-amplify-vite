# Test Coverage

## Component Tests (Vitest)
Tests that verify isolated component behavior.

📁 src/
└── __tests__/
    └── components/
        └── AuthComponent/
            ├── UnauthenticatedView.test.tsx
            └── AuthenticatedView.test.tsx

| Test | Purpose | Test Command | Status |
|------|---------|--------------|--------|
| Unauthenticated View<br>*`src/__tests__/components/AuthComponent/UnauthenticatedView.test.tsx`* | Verify sign-in and create account forms render and handle input correctly | `npm test UnauthenticatedView` | ✅ |
| Authenticated View<br>*`src/__tests__/components/AuthComponent/AuthenticatedView.test.tsx`* | Verify welcome message, sign-out, and delete account functionality | `npm test AuthenticatedView` | ✅ |

## Integration Tests (Vitest + Mocks)
Tests that verify component interactions using mocked services.

📁 src/
└── __tests__/
    └── integration/
        └── auth/
            ├── auth-flow.test.tsx
            └── user-lifecycle.test.tsx

| Test | Purpose | Test Command | Status |
|------|---------|--------------|--------|
| Auth Flow<br>*`src/__tests__/integration/auth/auth-flow.test.tsx`* | Verify complete authentication flow with mocked AWS services | `npm test auth-flow` | ✅ |
| User Lifecycle<br>*`src/__tests__/integration/auth/user-lifecycle.test.tsx`* | Verify account creation and deletion with mocked user services | `npm test user-lifecycle` | ✅ |

## E2E Tests (Playwright)
Tests that verify complete user journeys with real services.

📁 e2e/
└── auth/
    └── flows/
        ├── valid/
        │   ├── sign-in-flow.spec.ts
        │   ├── sign-up-flow.spec.ts
        │   └── account-deletion-flow.spec.ts
        └── invalid/
            ├── sign-in-validation.spec.ts
            └── sign-up-validation.spec.ts

| Test | Purpose | Test Command | Status |
|------|---------|--------------|--------|
| Valid Sign In<br>*`e2e/auth/flows/valid/sign-in-flow.spec.ts`* | Verify successful login with real AWS authentication | `npx playwright test sign-in-flow` | ✅ |
| Invalid Sign In<br>*`e2e/auth/flows/invalid/sign-in-validation.spec.ts`* | Verify error handling for incorrect credentials | `npx playwright test sign-in-validation` | ✅ |
| Valid Sign Up<br>*`e2e/auth/flows/valid/sign-up-flow.spec.ts`* | Verify successful account creation and email verification | `npx playwright test sign-up-flow` | ✅ |
| Invalid Sign Up<br>*`e2e/auth/flows/invalid/sign-up-validation.spec.ts`* | Verify validation errors and duplicate email handling | `npx playwright test sign-up-validation` | ✅ |
| Account Deletion<br>*`e2e/auth/flows/valid/account-deletion-flow.spec.ts`* | Verify successful account removal and cleanup | `npx playwright test account-deletion-flow` | ✅ |

## Visual Tests (Playwright)
Tests that verify visual appearance and responsive design.

📁 e2e/
└── auth/
    └── views/
        ├── unauthenticated.spec.ts
        ├── authenticated.spec.ts
        └── error-states.spec.ts

| Test | Purpose | Test Command | Status |
|------|---------|--------------|--------|
| Auth Forms<br>*`e2e/auth/views/unauthenticated.spec.ts`* | Verify responsive design of authentication forms | `npx playwright test unauthenticated --update-snapshots` | ✅ |
| Dashboard<br>*`e2e/auth/views/authenticated.spec.ts`* | Verify responsive design of authenticated dashboard | `npx playwright test authenticated --update-snapshots` | ✅ |
| Error States<br>*`e2e/auth/views/error-states.spec.ts`* | Verify visual appearance of error messages and validation | `npx playwright test error-states --update-snapshots` | ✅ |

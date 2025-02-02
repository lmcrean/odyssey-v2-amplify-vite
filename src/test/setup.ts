import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Mock CSS modules
vi.mock('@aws-amplify/ui-react/styles.css', () => ({}));
vi.mock('react-toastify/dist/ReactToastify.css', () => ({}));

// Automatically cleanup after each test
afterEach(() => {
  cleanup();
}); 
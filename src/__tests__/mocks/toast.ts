import { vi } from 'vitest';

export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  loading: vi.fn().mockReturnValue('mock-toast-id'),
  dismiss: vi.fn(),
  update: vi.fn(),
};

export const ToastContainer = () => null; 
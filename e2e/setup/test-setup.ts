import { test as base, expect } from '@playwright/test';
import { Amplify } from 'aws-amplify';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const configPath = resolve(__dirname, '../../amplify_outputs.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

// Configure Amplify for tests
Amplify.configure(config);

// Create a test fixture that includes Amplify configuration
export const test = base.extend({
  // Add any custom test fixtures here if needed
});

export { expect }; 

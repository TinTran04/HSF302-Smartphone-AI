import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  workers: 1,
  timeout: 60000,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:15173', ...devices['Desktop Chrome'], channel: 'chrome' },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 15173 --strictPort',
    url: 'http://127.0.0.1:15173',
    env: { VITE_ENABLE_MOCK_API: 'false', VITE_API_TARGET: 'http://127.0.0.1:18080' },
    reuseExistingServer: false,
    timeout: 30000,
  },
});

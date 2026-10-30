import type { Api } from './contracts';
import { realApi } from './realApi';
export const isDemo = import.meta.env.VITE_ENABLE_MOCK_API === 'true';
// Dynamic import keeps demo fixtures out of production bundles when disabled.
export const api: Api = isDemo ? (await import('../../mocks/mockApi')).mockApi : realApi;

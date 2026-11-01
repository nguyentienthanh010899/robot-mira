import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()], server: { proxy: { '/api': `http://127.0.0.1:${process.env.PORT || 3001}` } }, test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], restoreMocks: true } });

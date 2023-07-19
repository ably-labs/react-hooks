import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    root: 'src',
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
    },
});

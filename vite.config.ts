/// <reference types="vitest" />

import { defineConfig } from 'vite';
import analog from '@analogjs/platform';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    return {
        publicDir: 'src/public',
        build: {
            target: ['es2020'],
        },
        resolve: {
            mainFields: ['module'],
        },
        plugins: [
            analog({
                content: {
                    highlighter: 'shiki',
                    // Ensure index.md can be used as a home page
                },
                prerender: {
                    routes: async () => ['/'],
                },
            }),
            tsconfigPaths(),
        ],
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['src/test-setup.ts'],
            include: ['**/*.spec.ts'],
            reporters: ['default'],
        },
        define: {
            'import.meta.vitest': mode !== 'production',
        },
    };
});

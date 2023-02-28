import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		name: 'magiepifi-challenge-server',
		browser: false,
		environment: 'node',
		testTimeout: 60000, // 1 minute
		hookTimeout: 60000, // 1 minute
		useAtomics: true,
		cache: {
			dir: 'node_modules/.vitest',
		},
		threads: process.env.CI ? false : true,
		minThreads: 1,
		maxThreads: 12,
		env: {
			NODE_ENV: 'testing',
		},
	},
});

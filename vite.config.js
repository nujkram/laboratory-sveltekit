import { sveltekit } from '@sveltejs/kit/vite';
// import sentryVitePlugin from '@sentry/vite-plugin';

/** @type {import('vite').UserConfig} */
const config = {
	// build: {
	// 	sourcemap: true
	// },
	plugins: [
		sveltekit()
		// Put the Sentry vite plugin after all other plugins
		// sentryVitePlugin({
		// 	org: 'xtendops-3l',
		// 	project: 'applications-portal',

		// 	// Specify the directory containing build artifacts
		// 	include: './dist',

		// 	// Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
		// 	// and need `project:releases` and `org:read` scopes
		// 	authToken: process.env.PRIVATE_SENTRY_KEY

		// 	// Optionally uncomment the line below to override automatic release name detection
		// 	// release: process.env.RELEASE,
		// })
	]
};

export default config;

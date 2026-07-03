import adapter from '@sveltejs/adapter-vercel';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		// Deployed on Vercel. See https://kit.svelte.dev/docs/adapter-vercel
		// runtime is pinned because the local Node version (22) is newer than
		// this adapter knows about; nodejs20.x is the Vercel serverless runtime.
		adapter: adapter({ runtime: 'nodejs20.x' })
	}
};

export default config;

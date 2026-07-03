import clientPromise from "$lib/server/mongo";
import { dev } from '$app/environment';

export const handle =async ({event, resolve}:{event: any; resolve: any}) => {
    // Browsers (Chrome DevTools, etc.) probe /.well-known/* automatically.
    // Answer with 204 so it doesn't fall through to a 404 (and skip the DB lookup).
    if (event.url.pathname.startsWith('/.well-known/')) {
        return new Response(null, { status: 204 });
    }

    const session = event.cookies.get('meteor_login_token');

    if(!session) {
        event.locals.user = null;
        return await resolve(event);
    }

    const db = await clientPromise();
    const Users = db.collection('users');
    const user = await Users.findOne({'services.resume.loginTokens.hashedToken': session});

    if (user) {
        event.locals.user = {
            _id: user._id,
            name: user?.profile?.displayName || user?.emails?.[0]?.address,
            email: user?.emails?.[0]?.address,
            profile: user?.profile,
            role: user?.role,
        };
    } else {
        event.locals.user = null;
    }

    return await resolve(event);
}

/** @type {import('@sveltejs/kit').HandleServerError} */
export function handleError({ error }: { error: any }) {
	// example integration with https://sentry.io/
	// Sentry.captureException(error, { event });
	console.error('⚡️ Dev. Unhandled Error', error);
	console.error('#############################################');
	// console.error({ event });

	if (dev) {
		return {
			message: error.message,
			code: error?.code ?? 'UNKNOWN'
		};
	} else {
		return {
			message: error.message,
			code: error?.code ?? 'UNKNOWN'
		};
	}
}

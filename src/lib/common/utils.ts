import bcrypt from 'bcryptjs';
import { createMachine } from 'xstate';
import { writable } from 'svelte/store';

/**
 * @name Random.id
 * @summary Return a unique identifier, such as `"Jjwjg6gouWLXhMGKW"`, that is
 * likely to be unique in the whole world.
 * @locus Anywhere
 * @param {Number} [n] Optional length of the identifier in characters
 *   (defaults to 17)
 */
export function id(charsCount = 17) {
	return _randomString(charsCount, UNMISTAKABLE_CHARS);
}

const UNMISTAKABLE_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';

// Runs on both the browser (offline outbox ids) and the server. Prefer the
// WebCrypto RNG; the Math.random fallback only exists for runtimes without a
// global crypto. The tiny modulo bias is fine for ids (these are not secrets).
function _randomString(charsCount: number, alphabet: string) {
	let result = '';
	const cryptoObj = (globalThis as any).crypto;
	if (cryptoObj?.getRandomValues) {
		const values = new Uint32Array(charsCount);
		cryptoObj.getRandomValues(values);
		for (let i = 0; i < charsCount; i++) {
			result += alphabet[values[i] % alphabet.length];
		}
	} else {
		for (let i = 0; i < charsCount; i++) {
			result += alphabet[Math.floor(Math.random() * alphabet.length)];
		}
	}
	return result;
}

// Hash a password for storage. The client sends SHA256(plaintext) — never the
// plaintext itself — so what's stored is bcrypt(SHA256(plaintext)). Every
// caller (login, self-service change, admin reset, user creation) must follow
// that same contract or the resulting account can't sign in.
export const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, 10);
};

// Role used to gate management actions (edit/delete patients, records, users;
// resetting another user's password).
export const ADMIN_ROLE = 'Administrator';

// `user` is the shape stored on `locals.user` (see hooks.server.ts) or the
// client-side `$page.data.user`. Both carry a `role` string.
export const isAdmin = (user: any) => user?.role === ADMIN_ROLE;

export const formMachine = createMachine({
	id: 'form',
	initial: 'fresh',
	states: {
		fresh: {
			on: { SUBMIT: 'submitting' }
		},
		submitting: {
			on: { SUCCESS: 'success', ERROR: 'error' }
		},
		error: {
			on: { SUBMIT: 'submitting' }
		},
		success: {
			on: { CONTINUE: 'done' }
		},
		done: {}
	},
	predictableActionArguments: true
});

//? This is for login actions that aren't a full authentication
export const loginAction = createMachine({
	id: 'loginAction',
	initial: 'fresh',
	states: {
		fresh: {
			on: { SUBMIT: 'submitting' }
		},
		submitting: {
			on: { SUCCESS: 'success', ERROR: 'error' }
		},
		error: {
			on: { SUBMIT: 'submitting' }
		},
		success: {
			on: { CONTINUE: 'done' }
		},
		done: {}
	},
	predictableActionArguments: true
});

export const error = writable('');

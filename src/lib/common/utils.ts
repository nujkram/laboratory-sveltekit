import cryptoJS from 'crypto-js';
const { SHA256 } = cryptoJS;
import bcrypt from 'bcryptjs';
import { createMachine } from 'xstate';
import { writable } from 'svelte/store';
import type { users } from '@prisma/client';

export async function generateDisplayName(user: users) {
	return user?.profile?.displayname || user?.profile.firstname + ' ' + user?.profile.lastname;
}

/**
 * @name Random.id
 * @summary Return a unique identifier, such as `"Jjwjg6gouWLXhMGKW"`, that is
 * likely to be unique in the whole world.
 * @locus Anywhere
 * @param {Number} [n] Optional length of the identifier in characters
 *   (defaults to 17)
 */
export function id(charsCount = 17) {
	// 17 characters is around 96 bits of entropy, which is the amount of
	// state in the Alea PRNG.
	if (charsCount === undefined) {
		charsCount = 17;
	}

	return _randomString(charsCount, UNMISTAKABLE_CHARS);
}

const UNMISTAKABLE_CHARS = '23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz';
function _randomString(charsCount: number, alphabet: string) {
	let result = '';
	for (let i = 0; i < charsCount; i++) {
		result += choice(alphabet);
	}
	return result;
}

/**
 * @name Random.choice
 * @summary Return a random element of the given array or string.
 * @locus Anywhere
 * @param {Array|String} arrayOrString Array or string to choose from
 */
function choice(arrayOrString: string | any[]) {
	const index = Math.floor(Math.random() * arrayOrString.length);
	if (typeof arrayOrString === 'string') {
		return arrayOrString.substr(index, 1);
	}
	return arrayOrString[index];
}

// Extract the number of rounds used in the specified bcrypt hash.
export const getRoundsFromBcryptHash = (hash: string) => {
	let rounds;
	if (hash) {
		const hashSegments = hash.split('$');
		if (hashSegments.length > 2) {
			rounds = parseInt(hashSegments[2], 10);
		}
	}
	return rounds;
};

// Given a 'password' from the client, extract the string that we should
// bcrypt. 'password' can be one of:
//  - String (the plaintext password)
//  - Object with 'digest' and 'algorithm' keys. 'algorithm' must be "sha-256".
//
export const getPasswordString = (
	password:
		| string
		| {
				digest: string;
				algorithm: string;
		  }
) => {
	let pw;
	if (typeof password === 'string') {
		pw = SHA256(password);
	} else {
		// 'password' is an object
		if (password.algorithm !== 'sha-256') {
			throw new Error('Invalid password hash algorithm. ' + "Only 'sha-256' is allowed.");
		}
		pw = password.digest;
	}
	return pw;
};

// Use bcrypt to hash the password for storage in the database.
// `password` can be a string (in which case it will be run through
// SHA256 before bcrypt) or an object with properties `digest` and
// `algorithm` (in which case we bcrypt `password.digest`).
//

export const hashPassword = async (password: string) => {
	return await bcrypt.hash(password, 10);
};

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

/**
 * @description Converts a period-delimited string of keys into a nested object of is statements
 * @param str Period-delimited string of keys
 * @param defaultValue Final value to set for the final key in the hierarchy
 * @returns nested object
 */
export function convertToNestedObject(str: string, defaultValue: string) {
	// Split the input string on the "." character to create an array of keys
	const keys = str.split('.');

	// Create an empty object to hold the nested structure
	const nestedObj: any = {};

	// Create a reference to the current position in the object hierarchy
	let currentLevel = nestedObj;

	// Iterate over the keys array, creating new objects at each level of the hierarchy
	for (const key of keys) {
		currentLevel[key] = { is: {} };
		currentLevel = currentLevel[key].is;
	}

	// Set the default value for the final key in the hierarchy
	currentLevel.token = defaultValue;

	// Return the nested object
	return nestedObj;
}

export async function secretGenerator(length: number) {
	let result = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

// Encrypts data held on the device (patient info in the outbox + cached reference
// data). Uses AES-GCM with a NON-EXTRACTABLE key persisted in IndexedDB: the key
// can be used to encrypt/decrypt but its bytes can never be read out, so copying
// the database file or inspecting it in DevTools yields only ciphertext.
import { getDB } from './db.js';

let keyPromise;

async function getKey() {
	if (keyPromise) return keyPromise;
	keyPromise = (async () => {
		const db = await getDB();
		const existing = await db.get('keys', 'aes');
		if (existing?.key) return existing.key;
		const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, [
			'encrypt',
			'decrypt'
		]);
		await db.put('keys', { id: 'aes', key }); // CryptoKey is structured-cloneable
		return key;
	})();
	return keyPromise;
}

export async function encryptValue(obj) {
	const key = await getKey();
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const bytes = new TextEncoder().encode(JSON.stringify(obj));
	const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes);
	return { iv: Array.from(iv), ct: Array.from(new Uint8Array(ct)) };
}

export async function decryptValue(enc) {
	if (!enc) return null;
	const key = await getKey();
	const iv = new Uint8Array(enc.iv);
	const ct = new Uint8Array(enc.ct);
	const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
	return JSON.parse(new TextDecoder().decode(pt));
}

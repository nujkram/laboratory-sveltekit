// IndexedDB for offline support (browser-only). Two stores:
//  - outbox:  pending create/edit writes, replayed when back online
//  - refdata: cached reference lists + last-known user, so forms render offline
import { openDB } from 'idb';
import { browser } from '$app/environment';

const DB_NAME = 'labdb';
const DB_VERSION = 2;

let dbPromise;

export function getDB() {
	if (!browser) return Promise.resolve(null);
	if (!dbPromise) {
		dbPromise = openDB(DB_NAME, DB_VERSION, {
			upgrade(db) {
				if (!db.objectStoreNames.contains('outbox')) {
					const outbox = db.createObjectStore('outbox', { keyPath: 'queueId' });
					outbox.createIndex('status', 'status');
					outbox.createIndex('createdAt', 'createdAt');
				}
				if (!db.objectStoreNames.contains('refdata')) {
					db.createObjectStore('refdata', { keyPath: 'key' });
				}
				// v2: holds the non-extractable AES-GCM key used to encrypt payloads at rest.
				if (!db.objectStoreNames.contains('keys')) {
					db.createObjectStore('keys', { keyPath: 'id' });
				}
			}
		});
	}
	return dbPromise;
}

import { dev } from '$app/environment';
import dotenv from 'dotenv';
dotenv.config();
import { MongoClient, type Db } from 'mongodb';

const uri = process.env['DATABASE_URL'];

if (!uri) {
	throw new Error('Missing DATABASE_URL environment variable');
}

// Prefer an explicit DATABASE_NAME. The legacy fallback sniffs the connection
// string, which is brittle (a cluster name or password containing "Test"
// silently reroutes traffic) — set DATABASE_NAME to opt out of it.
const dbName =
	process.env['DATABASE_NAME'] ||
	(uri.includes('Staging') ? 'labStaging' : uri.includes('Test') ? 'labStagingTest' : 'lab');

if (dev && dbName === 'lab') {
	console.error('🚨 You are using the PRODUCTION database in development mode 🚨');
}

if (dev && dbName === 'labStagingTest') {
	console.info('You are using the Test database in development mode');
}

// Create the indexes that back our hottest queries and enforce invariants.
// createIndex is idempotent; failures are logged per-index, never fatal
// (the unique indexes can fail on legacy duplicate data — that's expected
// until the data is cleaned up, and everything else must still start).
async function ensureIndexes(db: Db) {
	const attempts: Array<[string, Promise<unknown>]> = [
		// every authenticated request: session token lookup (hooks.server.ts)
		[
			'users.loginTokens',
			db.collection('users').createIndex({ 'services.resume.loginTokens.hashedToken': 1 })
		],
		// login lookup + uniqueness backstop for user creation
		[
			'users.emails unique',
			db.collection('users').createIndex({ 'emails.address': 1 }, { unique: true, sparse: true })
		],
		// uniqueness backstop for the atomic case-number counter
		[
			'records.caseNumber unique',
			db.collection('records').createIndex({ caseNumber: 1 }, { unique: true, sparse: true })
		],
		// patient detail: match by patientId, sort by created desc
		['records.patient', db.collection('records').createIndex({ patientId: 1, created: -1 })],
		['records.created', db.collection('records').createIndex({ created: -1 })],
		['records.category', db.collection('records').createIndex({ category: 1 })],
		// patient/user lists: sort by created desc, filter/sort by name & status
		['patients.created', db.collection('patients').createIndex({ created: -1 })],
		['patients.lastName', db.collection('patients').createIndex({ lastName: 1 })],
		['patients.isActive', db.collection('patients').createIndex({ isActive: 1 })],
		['users.created', db.collection('users').createIndex({ created: -1 })]
	];
	const results = await Promise.allSettled(attempts.map(([, p]) => p));
	results.forEach((result, i) => {
		if (result.status === 'rejected') {
			console.error(`ensureIndexes: ${attempts[i][0]} failed (non-fatal):`, result.reason);
		}
	});
}

// Cache the *promise*, not the resolved handle — otherwise N concurrent
// requests on a cold start each open their own MongoClient. A failed connect
// clears the cache so the next request retries instead of failing forever.
let connectionPromise: Promise<{ client: MongoClient; db: Db }> | null = null;

function connect() {
	if (!connectionPromise) {
		connectionPromise = (async () => {
			const client = await MongoClient.connect(uri as string);
			const db = client.db(dbName);
			await ensureIndexes(db);
			return { client, db };
		})().catch((error) => {
			connectionPromise = null;
			throw error;
		});
	}
	return connectionPromise;
}

/** Shared database handle. */
const clientPromise = async (): Promise<Db> => (await connect()).db;

/** The underlying MongoClient — needed for sessions/transactions. */
export const getClient = async (): Promise<MongoClient> => (await connect()).client;

export default clientPromise;

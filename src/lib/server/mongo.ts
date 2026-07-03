import { dev } from '$app/environment';
import dotenv from 'dotenv';
dotenv.config();
import { MongoClient } from 'mongodb';

const uri = process.env['DATABASE_URL'];

const options = {
	useUnifiedTopology: true,
	useNewUrlParser: true
};

let cachedDb: any;

if (!uri) {
	throw new Error('Please DATABASE_URL to your environment');
}

if (dev && !uri?.includes('Staging') && !uri?.includes('Test')) {
	console.info('🚨 You are using Production database in development mode 🚨');
}

if (dev && uri?.includes('Test')) {
	console.info('🚨 You are using Test database in development mode 🚨');
}

// Create the indexes that back our hottest queries. createIndex is idempotent,
// so this is safe to call on every cold start; it runs once per process because
// connectToDatabase caches the db. Failures are logged, never fatal.
async function ensureIndexes(db: any) {
	try {
		await Promise.all([
			// patient detail: match by patientId, sort by created desc
			db.collection('records').createIndex({ patientId: 1, created: -1 }),
			db.collection('records').createIndex({ created: -1 }),
			db.collection('records').createIndex({ category: 1 }),
			// patient/user lists: sort by created desc, filter/sort by name & status
			db.collection('patients').createIndex({ created: -1 }),
			db.collection('patients').createIndex({ lastName: 1 }),
			db.collection('patients').createIndex({ isActive: 1 }),
			db.collection('users').createIndex({ created: -1 })
		]);
	} catch (error) {
		console.error('ensureIndexes failed (non-fatal):', error);
	}
}

async function connectToDatabase() {
	if (cachedDb) return cachedDb;

	const client = await MongoClient.connect(uri, options);

	const currentDb = uri?.includes('Staging')
		? 'labStaging'
		: uri?.includes('Test')
		? 'labStagingTest'
		: 'labStaging';

	const db = await client.db(currentDb);
	cachedDb = db;
	await ensureIndexes(db);
	return db;
}
const clientPromise = async () => await connectToDatabase();
// cachedDb = new MongoClient(uri, options);
// clientPromise = cachedDb.connect();

// Export a module-scoped MongoClient promise.
// By doing this in a separate module,
// the client can be shared across functions.
export default clientPromise;
